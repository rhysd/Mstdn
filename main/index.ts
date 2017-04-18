import {app} from 'electron';
import log from './log';
import startApp from './app';
import loadConfig from './config';

// default_app sets app.on('all-window-closed', () => app.quit()) before
// loading this application. We need to disable the callback.
app.removeAllListeners();

const appReady = new Promise<void>(resolve => app.once('ready', resolve));

process.on('unhandledRejection', (reason: string) => {
    log.error('FATAL: Unhandled rejection! Reason:', reason);
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
