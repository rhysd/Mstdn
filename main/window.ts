import {app, BrowserWindow, shell, dialog, Menu} from 'electron';
import windowState = require('electron-window-state');
import * as menubar from 'menubar';
import {Config, Account} from './config';
import {partitionForAccount} from './account_switcher';
import log from './log';
import {IS_DEBUG, IS_DARWIN, IS_WINDOWS, IS_LINUX, APP_ICON, PRELOAD_JS, trayIcon} from './common';

const ELECTRON_ISSUE_9230 = IS_WINDOWS || IS_LINUX;

export default class Window {
    static create(account: Account, config: Config, mb: Menubar.MenubarApp | null = null) {
        if (config.normal_window) {
            return startNormalWindow(account, config);
        } else {
            return startMenuBar(account, config, mb);
        }
    }

    constructor(
        public browser: Electron.BrowserWindow,
        public state: any /*XXX: ElectronWindowState.WindowState */,
        public account: Account,
        public menubar: Menubar.MenubarApp | null,
    ) {
        if (!IS_DARWIN) {
            // Users can still access menu bar with pressing Alt key.
            browser.setMenu(Menu.getApplicationMenu());
        }

        browser.webContents.on('will-navigate', (e, url) => {
            if (!url.startsWith(`https://${this.account.host}`)) {
                e.preventDefault();
                shell.openExternal(url);
            }
            log.debug('Opened URL with external browser (will-navigate)', url);
        });
        browser.webContents.on('new-window', (e, url) => {
            if (ELECTRON_ISSUE_9230) {
                // XXX:
                // On Windows or Linux, rel="noopener" lets app crash on preventing the event.
                // Issue: https://github.com/electron/electron/issues/9230
                return;
            }
            e.preventDefault();
            shell.openExternal(url);
            log.debug('Opened URL with external browser (new-window)', url);
        });

        browser.webContents.session.setPermissionRequestHandler((contents, permission, callback) => {
            const url = contents.getURL();
            const grantedByDefault =
                url.startsWith(`https://${this.account.host}`) &&
                permission !== 'geolocation' &&
                permission !== 'media';

            if (grantedByDefault) {
                // Granted
                log.debug('Permission was granted', permission);
                callback(true);
                return;
            }

            log.debug('Create dialog for user permission', permission);
            dialog.showMessageBox({
                type: 'question',
                buttons: ['Accept', 'Reject'],
                message: `Permission '${permission}' is requested by ${url}`,
                detail: "Please choose one of 'Accept' or 'Reject'",
            }, (buttonIndex: number) => {
                const granted = buttonIndex === 0;
                callback(granted);
            });
        });
    }

    open(url: string) {
        log.debug('Open URL:', url);
        this.browser.loadURL(url);
    }

    close() {
        log.debug('Closing window:', this.account);
        this.state.unmanage();
        this.browser.webContents.removeAllListeners();
        this.browser.removeAllListeners();
        if (this.menubar) {
            // Note:
            // menubar.windowClear() won't be called because all listners was removed
            delete this.menubar.window;
        }
        this.browser.close();
    }
}

function startNormalWindow(account: Account, config: Config): Promise<Window> {
    log.debug('Setup a normal window');
    return new Promise<Window>(resolve => {
        const state = windowState({
            defaultWidth: 600,
            defaultHeight: 800,
        });
        const win = new BrowserWindow({
            width: state.width,
            height: state.height,
            x: state.x,
            y: state.y,
            icon: APP_ICON,
            show: false,
            useContentSize: true,
            autoHideMenuBar: config.hide_menu,
            webPreferences: {
                nodeIntegration: false,
                sandbox: true,
                preload: PRELOAD_JS,
                partition: partitionForAccount(account),
            },
        });
        win.once('ready-to-show', () => {
            win.show();
        });
        win.once('closed', () => {
            app.quit();
        });

        if (state.isFullScreen) {
            win.setFullScreen(true);
        } else if (state.isMaximized) {
            win.maximize();
        }
        state.manage(win);

        win.webContents.on('dom-ready', () => {
            log.debug('Send config to renderer procress');
            win.webContents.send('mstdn:config', config, account);
        });
        win.webContents.once('dom-ready', () => {
            log.debug('Normal window application was launched');
            if (IS_DEBUG) {
                win.webContents.openDevTools({mode: 'detach'});
            }
        });

        resolve(new Window(win, state, account, null));
    });
}

function startMenuBar(account: Account, config: Config, bar: Menubar.MenubarApp | null): Promise<Window> {
    log.debug('Setup a menubar window');
    return new Promise<Window>(resolve => {
        const state = windowState({
            defaultWidth: 350,
            defaultHeight: 420,
        });
        const icon = trayIcon(config.icon_color);
        const mb = bar || menubar({
            icon,
            width: state.width,
            height: state.height,
            alwaysOnTop: IS_DEBUG || !!config.always_on_top,
            tooltip: 'Mstdn',
            useContentSize: true,
            autoHideMenuBar: false,
            show: false,
            showDockIcon: true,
            webPreferences: {
                nodeIntegration: false,
                sandbox: true,
                preload: PRELOAD_JS,
                partition: partitionForAccount(account),
            },
        });
        mb.once('after-create-window', () => {
            log.debug('Menubar application was launched');
            if (IS_DEBUG) {
                mb.window.webContents.openDevTools({mode: 'detach'});
            }
            mb.window.webContents.on('dom-ready', () => {
                log.debug('Send config to renderer procress');
                mb.window.webContents.send('mstdn:config', config, account);
            });
            state.manage(mb.window);

            resolve(new Window(mb.window, state, account, mb));
        });
        mb.once('after-close', () => {
            app.quit();
        });
        if (bar) {
            log.debug('Recreate menubar window with different partition:', account);
            const pref = mb.getOption('webPreferences');
            pref.partition = partitionForAccount(account);
            mb.setOption('webPreferences', pref);
            mb.showWindow();
        } else {
            log.debug('New menubar instance was created:', account);
            mb.once('ready', () => mb.showWindow());
        }
    });
}

