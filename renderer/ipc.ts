import log from './log';
import r from './require';
const electron = r('electron');
const ipc = electron.ipcRenderer;

export function on(channel: IpcChannelFromMain, callback: (...args: any[]) => void) {
    ipc.on(channel, (...args: any[]) => {
        log.info('IPC: Received from:', channel, args);
        // XXX: Weird...
        // First element is Event in Windows as documented. But not in macOS.
        if (args[0] instanceof Event) {
            args = args.splice(1);
        }
        callback(...args);
    });
}

export function send(channel: IpcChannelFromRenderer, ...args: any[]) {
    log.info('IPC: Send:', channel, args);
    ipc.send(channel, ...args);
}
