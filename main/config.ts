import {app, systemPreferences} from 'electron';
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
        zoom_factor: 1.0,
        accounts: [],
        keymaps: {},
    };
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
                    fs.writeFile(file, JSON.stringify(default_config, null, 2));
                } else {
                    app.once('ready', () => fs.writeFile(file, JSON.stringify(default_config, null, 2)));
                }
                return resolve(default_config);
            }

            try {
                const config = JSON.parse(json);
                if (config.hot_key && config.hot_key.startsWith('mod+')) {
                    config.hot_key = `CmdOrCtrl+${config.hot_key.slice(4)}`;
                }
                log.debug('Configuration was loaded successfully', config);
                resolve(config);
            } catch (e) {
                log.error('Error on loading JSON file, will load default configuration:', e.message);
                resolve(makeDefaultConfig());
            }
        });
    });
}
