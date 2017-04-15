import log from './log';
import r from './require';
const electron = r('electron');
const ipc = electron.ipcRenderer;

export function on(channel: IpcChannel, callback: Function) {
    ipc.on(channel, (...args: any[]) => {
        log.info('IPC: Received from:', channel, args);
        callback(...args);
    });
}
