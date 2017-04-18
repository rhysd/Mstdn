import * as path from 'path';
import {app, Menu} from 'electron';
import log from './log';
import {Config} from './config';
import AccountSwitcher from './account_switcher';
import defaultMenu from './default_menu';
import Window from './window';

const IS_DARWIN = process.platform === 'darwin';
const APP_ICON = path.join(__dirname, '..', 'resources', 'icon', 'icon.png');

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
        this.switcher = new AccountSwitcher(win.browser, this.config.accounts);
        this.switcher.on('did-switch', () => this.open());
    }

    open() {
        const url = `https://${this.switcher.current.host}${this.switcher.current.default_page}`;
        this.win.open(url);
        log.debug('Open URL: ', url);
    }
}

export default function startApp(config: Config) {
    return Window.create(config).then(win => new App(win, config));
}
