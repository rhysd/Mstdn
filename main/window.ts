import * as fs from 'fs';
import {app, BrowserWindow, shell, dialog, Menu} from 'electron';
import windowState = require('electron-window-state');
import * as menubar from 'menubar';
import {Config, Account, hostUrl} from './config';
import {partitionForAccount} from './account_switcher';
import log from './log';
import {IS_DEBUG, IS_DARWIN, IS_WINDOWS, APP_ICON, PRELOAD_JS, USER_CSS, IOS_SAFARI_USERAGENT, trayIcon} from './common';

function shouldOpenInternal(host: string, url: string): boolean {
    if (host.startsWith('https://pawoo.net') && url.startsWith('https://accounts.pixiv.net/login?')) {
        log.debug('accounts.pixiv.net opens and will redirect to pawoo.net for signin with Pixiv account.');
        return true;
    }

    return false;
}

export default class Window {
    static create(account: Account, config: Config, mb: Menubar.MenubarApp | null = null) {
        return (config.normal_window ? startNormalWindow(account, config) : startMenuBar(account, config, mb))
            .then(win => {
                win.browser.webContents.on('dom-ready', () => {
                    applyUserCss(win.browser, config);
                    win.browser.webContents.setZoomFactor(config.zoom_factor);
                    log.debug('Send config to renderer procress');
                    win.browser.webContents.send('mstdn:config', config, account);
                });
                return win;
            });
    }

    constructor(
        public browser: Electron.BrowserWindow,
        public state: any /*XXX: ElectronWindowState.WindowState */,
        public account: Account,
        /* tslint:disable:no-shadowed-variable */
        public menubar: Menubar.MenubarApp | null,
        /* tslint:enable:no-shadowed-variable */
    ) {
        if (!IS_DARWIN) {
            // Users can still access menu bar with pressing Alt key.
            browser.setMenu(Menu.getApplicationMenu());
        }

        browser.webContents.on('will-navigate', (e, url) => {
            const host = hostUrl(this.account);
            if (url.startsWith(host)) {
                return;
            }

            if (shouldOpenInternal(host, url)) {
                return;
            }

            e.preventDefault();
            shell.openExternal(url);
            log.debug('Opened URL with external browser (will-navigate)', url);
        });
        browser.webContents.on('new-window', (e, url) => {
            e.preventDefault();
            shell.openExternal(url);
            log.debug('Opened URL with external browser (new-window)', url);
        });

        browser.webContents.session.setPermissionRequestHandler((contents, permission, callback) => {
            const url = contents.getURL();
            const grantedByDefault =
                url.startsWith(hostUrl(this.account)) &&
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
        this.browser.webContents.once('did-get-redirect-request', (e: Event, _: string, newUrl: string) => {
            if (url === newUrl) {
                return;
            }
            log.debug('Redirecting to ' + newUrl + '. Will navigate to login page for user using single user mode');
            e.preventDefault();
            this.browser.loadURL(hostUrl(this.account) + '/auth/sign_in');
        });
        if (url.startsWith('https://pawoo.net')) {
            this.browser.loadURL(url, {
                userAgent: IOS_SAFARI_USERAGENT,
            });
        } else {
            this.browser.loadURL(url);
        }
    }

    close() {
        log.debug('Closing window:', this.account);
        this.state.saveState();
        this.state.unmanage();
        this.browser.webContents.removeAllListeners();
        this.browser.removeAllListeners();
        if (this.menubar) {
            // Note:
            // menubar.windowClear() won't be called because all listeners were removed
            delete this.menubar.window;
        }
        this.browser.close();
    }

    toggle() {
        if (this.menubar) {
            if (this.browser.isFocused()) {
                log.debug('Toggle window: shown -> hidden');
                this.menubar.hideWindow();
            } else {
                log.debug('Toggle window: hidden -> shown');
                this.menubar.showWindow();
            }
        } else {
            if (this.browser.isFocused()) {
                log.debug('Toggle window: shown -> hidden');
                if (IS_DARWIN) {
                    app.hide();
                } else if (IS_WINDOWS) {
                    this.browser.minimize();
                } else {
                    this.browser.hide();
                }
            } else {
                log.debug('Toggle window: hidden -> shown');
                this.browser.show();
                if (IS_WINDOWS) {
                    this.browser.focus();
                }
            }
        }
    }
}

function applyUserCss(win: Electron.BrowserWindow, config: Config) {
    if (config.chromium_sandbox) {
        log.debug('User CSS is disabled because Chromium sandbox is enabled');
        return;
    }
    fs.readFile(USER_CSS, 'utf8', (err, css) => {
        if (err) {
            log.debug('Failed to load user.css: ', err.message);
            return;
        }
        win.webContents.insertCSS(css);
        log.debug('Applied user CSS:', USER_CSS);
    });
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
            autoHideMenuBar: !!config.hide_menu,
            webPreferences: {
                nodeIntegration: false,
                sandbox: sandboxFlag(config, account),
                preload: PRELOAD_JS,
                partition: partitionForAccount(account),
                zoomFactor: config.zoom_factor,
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

        win.webContents.once('dom-ready', () => {
            log.debug('Normal window application was launched');
            if (IS_DEBUG) {
                win.webContents.openDevTools({mode: 'detach'});
            }
        });

        resolve(new Window(win, state, account, null));
    });
}

function sandboxFlag(config: Config, account: Account) {
    // XXX:
    // Electron has a bug that CSP prevents preload script from being loaded.
    // mstdn.jp enables CSP. So currently we need to disable native sandbox to load preload script.
    //
    //   Ref: https://github.com/electron/electron/issues/9276
    //
    const electronBugIssue9276 = account.host === 'mstdn.jp' || account.host === 'https://mstdn.jp';
    if (electronBugIssue9276) {
        return false;
    }
    return !!config.chromium_sandbox;
}

function startMenuBar(account: Account, config: Config, bar: Menubar.MenubarApp | null): Promise<Window> {
    log.debug('Setup a menubar window');
    return new Promise<Window>(resolve => {
        const state = windowState({
            defaultWidth: 320,
            defaultHeight: 420,
        });
        const icon = trayIcon(config.icon_color);
        const mb = bar || menubar({
            icon,
            width: state.width,
            height: state.height,
            alwaysOnTop: IS_DEBUG || !!config.always_on_top,
            tooltip: 'Mstdn',
            autoHideMenuBar: !!config.hide_menu,
            show: false,
            showDockIcon: true,
            webPreferences: {
                nodeIntegration: false,
                sandbox: sandboxFlag(config, account),
                preload: PRELOAD_JS,
                partition: partitionForAccount(account),
                zoomFactor: config.zoom_factor,
            },
        });
        mb.once('after-create-window', () => {
            log.debug('Menubar application was launched');
            if (IS_DEBUG) {
                mb.window.webContents.openDevTools({mode: 'detach'});
            }
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
            pref.sandbox = sandboxFlag(config, account);
            mb.setOption('webPreferences', pref);
            mb.showWindow();
        } else {
            log.debug('New menubar instance was created:', account);
            mb.once('ready', () => mb.showWindow());
        }
    });
}

