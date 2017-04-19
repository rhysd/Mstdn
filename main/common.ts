import * as path from 'path';
import {app} from 'electron';

export const IS_DEBUG = process.env.NODE_ENV === 'development';
export const IS_DARWIN = process.platform === 'darwin';
export const IS_WINDOWS = process.platform === 'win32';
export const APP_ICON = path.join(__dirname, '..', 'resources', 'icon', 'icon.png');
export const PRELOAD_JS = path.join(__dirname, '..', 'renderer', 'preload.js');
export const DATA_DIR = app.getPath('userData');
export const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

export function trayIcon(color: string) {
    return path.join(__dirname, '..', 'resources', 'icon', `tray-icon-${
        color === 'white' ? 'white' : 'black'
    }@2x.png`);
}

