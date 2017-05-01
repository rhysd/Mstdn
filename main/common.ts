import * as path from 'path';
import {app} from 'electron';

export const IS_DEBUG = process.env.NODE_ENV === 'development';
export const IS_DARWIN = process.platform === 'darwin';
export const IS_WINDOWS = process.platform === 'win32';
export const IS_LINUX = process.platform === 'linux';
export const APP_ICON = path.join(__dirname, '..', 'resources', 'icon', 'icon.png');
export const PRELOAD_JS = path.join(__dirname, '..', 'renderer', 'preload.js');
export const DATA_DIR = app.getPath('userData');
export const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
export const USER_CSS = path.join(DATA_DIR, 'user.css');
export const IOS_SAFARI_USERAGENT = 'Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A300 Safari/602.1';

export function trayIcon(color: string) {
    return path.join(__dirname, '..', 'resources', 'icon', `tray-icon-${
        color === 'white' ? 'white' : 'black'
    }@2x.png`);
}

