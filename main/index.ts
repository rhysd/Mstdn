import {app, dialog} from 'electron';
import log from './log';
import startApp from './app';
import loadConfig from './config';

// default_app sets app.on('all-window-closed', () => app.quit()) before
// loading this application. We need to disable the callback.
app.removeAllListeners();

const appReady = new Promise<void>(resolve => app.once('ready', resolve));

process.on('unhandledRejection', (reason: string) => {
    const msg = 'FATAL: Unhandled rejection! Reason: ' + reason
    appReady.then(() => {
        dialog.showMessageBox({
            type: 'error',
            buttons: ['OK'],
            message: msg,
        }, () => {
            qpp.quit();
        })
    });
    log.error(msg);
});

app.on('will-quit', () => {
    log.debug('Application is quitting');
});

Promise.all([
    loadConfig(),
    appReady
]).then(([config, _]) => startApp(config)).then(mstdn => {
    mstdn.start();
    log.debug('Application launched!');
});
