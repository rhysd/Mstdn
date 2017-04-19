import log from './log';
import r from './require';
const electron = r('electron');
const ipc = electron.ipcRenderer;

export function on(channel: IpcChannelFromMain, callback: (...args: any[]) => void) {
    ipc.on(channel, (_, ...args: any[]) => {
        log.info('IPC: Received from:', channel, args);
        callback(...args);
    });
}

export function send(channel: IpcChannelFromRenderer, ...args: any[]) {
    log.info('IPC: Send:', channel, args);
    ipc.send(channel, ...args);
}
