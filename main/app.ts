import {app, Menu, globalShortcut, Tray} from 'electron';
import log from './log';
import {Config, Account} from './config';
import AccountSwitcher from './account_switcher';
import defaultMenu from './default_menu';
import Window from './window';
import {IS_DARWIN, APP_ICON, trayIcon} from './common';

export class App {
    private switcher: AccountSwitcher;

    constructor(private win: Window, private config: Config) {
        if (config.accounts.length === 0) {
            throw new Error('No account found. Please check the config.');
        }
        if (IS_DARWIN) {
            app.dock.setIcon(APP_ICON);
        }
        Menu.setApplicationMenu(defaultMenu());
        this.switcher = new AccountSwitcher(this.config.accounts);
        this.switcher.on('switch', this.onAccountSwitch);

        this.setupTray();
        this.setupHotkey();
    }

    private setupHotkey() {
        if (!this.config.hot_key) {
            return;
        }

        if (this.win.menubar) {
            globalShortcut.register(this.config.hot_key, () => {
                const mb = this.win.menubar!;
                if (mb.window.isFocused()) {
                    log.debug('Toggle window: shown -> hidden');
                    mb.hideWindow();
                } else {
                    log.debug('Toggle window: hidden -> shown');
                    mb.showWindow();
                }
            });
        } else {
            globalShortcut.register(this.config.hot_key, this.toggleNormalWindow);
        }
        log.debug('Hot key was set to:', this.config.hot_key);
    }

    start() {
        const a = this.switcher.current;
        const url = `https://${a.host}${a.default_page}`;
        this.win.open(url);
        log.debug('Application started', a, url);
    }

    private setupTray() {
        if (this.win.menubar) {
            // Note:
            // If it's menubar window, tray will be put in menubar().
            return;
        }

        const icon = trayIcon(this.config.icon_color);
        const tray = new Tray(icon);
        tray.on('click', this.toggleNormalWindow);
        tray.on('double-click', this.toggleNormalWindow);
        if (IS_DARWIN) {
            tray.setHighlightMode('never');
        }
    }

    private toggleNormalWindow = () => {
        const win = this.win.browser;
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
    }

    private onAccountSwitch = (next: Account) => {
        this.win.close();
        Window.create(next, this.config, this.win.menubar).then(win => {
            log.debug('Window was recreated again', next);
            this.win = win;
            this.start();
        });
    }
}

export default function startApp(config: Config) {
    const default_account = config.accounts[0];
    return Window.create(default_account, config)
        .then(win => new App(win, config));
}
