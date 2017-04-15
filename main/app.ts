import * as path from 'path';
import {app, BrowserWindow, globalShortcut, Tray} from 'electron';
import windowState = require('electron-window-state');
import * as menubar from 'menubar';
import log from './log';
import {Config, Account} from './config'

const IS_DEBUG = process.env.NODE_ENV === 'development';
const IS_DARWIN = process.platform === 'darwin';
const APP_ICON = path.join(__dirname, '..', 'resources', 'icon.png');
const DEFAULT_WIDTH = 340;
const DEFAULT_HEIGHT = 400;

export class App {
    private account: Account;

    constructor(private win: Electron.BrowserWindow, private config: Config) {
        if (config.accounts.length === 0) {
            throw new Error('No account found. Please check the config.');
        }
        this.account = this.config.accounts[0];
    }

    open() {
        this.win.loadURL(`https://${this.account.host}${this.account.default_page}`);
        this.win.show();
    }
}

function trayIcon(color: string) {
    return path.join(__dirname, '..', 'resources', 'icon', `tray-icon-${
        color === 'white' ? 'white' : 'black'
    }@2x.png`);
}

export default function startApp (config: Config) {
    return (config.normal_window ? startNormalWindow : startMenuBar)(config)
        .then(win => new App(win, config));
}

function startNormalWindow(config: Config): Promise<Electron.BrowserWindow> {
    log.debug('Setup a normal window');
    return new Promise<Electron.BrowserWindow>(resolve => {
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
            autoHideMenuBar: true,
            webPreferences: {
                nodeIntegration: false,
                sandbox: true,
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

        const toggleWindow = () => {
            if (win.isFocused()) {
                log.debug('Toggle window: shown -> hidden');
                if (IS_DARWIN) {
                    app.hide();
                } else {
                    win.hide();
                }
            } else {
                log.debug('Toggle window: hidden -> shown');
                win.show();
            }
        };

        win.webContents.on('dom-ready', () => {
            log.debug('Send config to renderer procress');
            win.webContents.send('mstdn:config', config);
        });
        win.webContents.once('dom-ready', () => {
            log.debug('Normal window application was launched');
            if (config.hot_key) {
                globalShortcut.register(config.hot_key, toggleWindow);
                log.debug('Hot key was set to:', config.hot_key);
            }
            if (IS_DEBUG) {
                win.webContents.openDevTools({mode: 'detach'});
            }
            resolve(win);
        });

        const normalIcon = trayIcon(config.icon_color);
        const tray = new Tray(normalIcon);
        tray.on('click', toggleWindow);
        tray.on('double-click', toggleWindow);
        if (IS_DARWIN) {
            tray.setHighlightMode('never');
            app.dock.setIcon(APP_ICON);
        }
    });
}

function startMenuBar(config: Config): Promise<Electron.BrowserWindow> {
    log.debug('Setup a menubar window');
    return new Promise<Electron.BrowserWindow>(resolve => {
        const state = windowState({
            defaultWidth: DEFAULT_WIDTH,
            defaultHeight: DEFAULT_HEIGHT,
        });
        const icon = trayIcon(config.icon_color);
        const mb = menubar({
            icon,
            width: state.width,
            height: state.height,
            alwaysOnTop: IS_DEBUG || !!config.always_on_top,
            tooltip: 'Mstdn',
            showDockIcon: true,
            autoHideMenuBar: true,
            useContentSize: true,
            show: false,
            webPreferences: {
                nodeIntegration: false,
                sandbox: true,
            },
        });
        mb.once('ready', () => mb.showWindow());
        mb.once('after-create-window', () => {
            log.debug('Menubar application was launched');
            if (config.hot_key) {
                globalShortcut.register(config.hot_key, () => {
                    if (mb.window.isFocused()) {
                        log.debug('Toggle window: shown -> hidden');
                        mb.hideWindow();
                    } else {
                        log.debug('Toggle window: hidden -> shown');
                        mb.showWindow();
                    }
                });
                log.debug('Hot key was set to:', config.hot_key);
            }
            if (IS_DEBUG) {
                mb.window.webContents.openDevTools({mode: 'detach'});
            }
            mb.window.webContents.on('dom-ready', () => {
                log.debug('Send config to renderer procress');
                mb.window.webContents.send('mstdn:config', config);
            });
            state.manage(mb.window);

            resolve(mb.window);
        });
        mb.once('after-close', () => {
            app.quit();
        });
    });
}
