import {ipcRenderer as ipc} from 'electron';
import log from './log';

export function on(channel: IpcChannelFromMain, callback: (...args: any[]) => void) {
    ipc.on(channel, (_: any, ...args: any[]) => {
        log.info('IPC: Received from:', channel, args);
        callback(...args);
    });
}

export function send(channel: IpcChannelFromRenderer, ...args: any[]) {
    log.info('IPC: Send:', channel, args);
    ipc.send(channel, ...args);
}
