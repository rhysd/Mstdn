import {app, systemPreferences, dialog, shell} from 'electron';
import * as fs from 'fs';
import log from './log';
import {CONFIG_FILE, IS_DARWIN, IS_WINDOWS, DATA_DIR} from './common';

export interface Account {
    host: string;
    name: string;
    default_page: string;
}

export interface Config {
    hot_key: string;
    icon_color: string;
    always_on_top: boolean;
    hide_menu: boolean;
    normal_window: boolean;
    zoom_factor: number;
    accounts: Account[];
    chromium_sandbox: boolean;
    __DATA_DIR?: string;
    keymaps: {[key: string]: string};
    preload: string[];
}

function makeDefaultConfig(): Config {
    const IsDarkMode = IS_DARWIN && systemPreferences.isDarkMode();
    const menubarBroken = IS_WINDOWS;

    return {
        hot_key: 'CmdOrCtrl+Shift+S',
        icon_color: IsDarkMode ? 'white' : 'black',
        always_on_top: false,
        hide_menu: false,
        normal_window: menubarBroken,
        zoom_factor: 0.9,
        chromium_sandbox: true,
        accounts: [{
            name: '',
            host: '',
            default_page: '/web/timelines/home',
        }],
        keymaps: {
            j: 'scroll-down',
            k: 'scroll-up',
            i: 'scroll-top',
            m: 'scroll-bottom',
            1: '/web/statuses/new',
            2: '/web/timelines/home',
            3: '/web/notifications',
            4: '/web/timelines/public/local',
            5: '/web/timelines/public',
            6: '/web/getting-started'
        },
        preload: [],
    };
}

function showDyingDialog(title: string, detail: string) {
    dialog.showMessageBox({
        type: 'info',
        message: title,
        detail,
    }, () => {
        app.quit();
    });
}

function recommendConfigAndDie(file: string) {
    const title = 'Please write configuration in JSON';
    const detail = 'You need to write up name and host in first item of accounts. Restart this app after writing up them. Please see README for more detail: https://github.com/rhysd/Mstdn#readme';
    shell.openItem(file);
    showDyingDialog(title, detail);
}

export default function loadConfig(): Promise<Config> {
    return new Promise<Config>(resolve => {
        fs.readFile(CONFIG_FILE, 'utf8', (err, json) => {
            if (err) {
                log.info('Configuration file was not found, will create:', CONFIG_FILE);
                const default_config = makeDefaultConfig();
                // Note:
                // If calling writeFile() directly here, it tries to create config file before Electron
                // runtime creates data directory. As the result, writeFile() would fail to create a file.
                if (app.isReady()) {
                    fs.writeFileSync(CONFIG_FILE, JSON.stringify(default_config, null, 2));
                    recommendConfigAndDie(CONFIG_FILE);
                } else {
                    app.once('ready', () => {
                        fs.writeFileSync(CONFIG_FILE, JSON.stringify(default_config, null, 2));
                        recommendConfigAndDie(CONFIG_FILE);
                    });
                }
                return;
            }

            try {
                const config = JSON.parse(json);
                if (config.hot_key && config.hot_key.startsWith('mod+')) {
                    config.hot_key = `CmdOrCtrl+${config.hot_key.slice(4)}`;
                }
                log.debug('Configuration was loaded successfully', config);
                if (!config.accounts || config.accounts[0].host === '' || config.accounts[0].name === '') {
                    recommendConfigAndDie(CONFIG_FILE);
                } else {
                    config.__DATA_DIR = DATA_DIR;
                    if (config.chromium_sandbox === undefined) {
                        config.chromium_sandbox = true;
                    }
                    resolve(config);
                }
            } catch (e) {
                log.debug('Error on loading JSON file', e);
                showDyingDialog('Error on loading JSON file', e.message);
            }
        });
    });
}
