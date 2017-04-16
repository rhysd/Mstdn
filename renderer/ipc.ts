import log from './log';
import r from './require';
const electron = r('electron');
const ipc = electron.ipcRenderer;

export function on(channel: IpcChannel, callback: (...args: any[]) => void) {
    ipc.on(channel, (...args: any[]) => {
        log.debug('IPC: Received from:', channel, args);
        callback(...args);
    });
}
