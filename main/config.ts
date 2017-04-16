import {app, systemPreferences, dialog, shell} from 'electron';
import * as fs from 'fs';
import {join} from 'path';
import log from './log';

export interface Account {
    host: string;
    name: string;
    default_page: string;
}

export interface Config {
    hot_key: string;
    icon_color: string;
    always_on_top: boolean;
    normal_window: boolean;
    zoom_factor: number;
    accounts: Account[];
    keymaps: {[key: string]: string};
}

function makeDefaultConfig(): Config {
    const IsDarkMode = (process.platform === 'darwin') && systemPreferences.isDarkMode();
    const menubarBroken = process.platform === 'win32';

    return {
        hot_key: 'CmdOrCtrl+Shift+S',
        icon_color: IsDarkMode ? 'white' : 'black',
        always_on_top: false,
        normal_window: menubarBroken,
        zoom_factor: 0.9,
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
        const dir = app.getPath('userData');
        const file = join(dir, 'config.json');
        fs.readFile(file, 'utf8', (err, json) => {
            if (err) {
                log.info('Configuration file was not found, will create:', file);
                const default_config = makeDefaultConfig();
                // Note:
                // If calling writeFile() directly here, it tries to create config file before Electron
                // runtime creates data directory. As the result, writeFile() would fail to create a file.
                if (app.isReady()) {
                    fs.writeFileSync(file, JSON.stringify(default_config, null, 2));
                    recommendConfigAndDie(file);
                } else {
                    app.once('ready', () => {
                        fs.writeFileSync(file, JSON.stringify(default_config, null, 2));
                        recommendConfigAndDie(file);
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
                    recommendConfigAndDie(file);
                } else {
                    resolve(config);
                }
            } catch (e) {
                log.debug('Error on loading JSON file', e);
                showDyingDialog('Error on loading JSON file', e.message);
            }
        });
    });
}
