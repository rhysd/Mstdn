import {Config, Account} from '../main/config';
import * as Ipc from './ipc';
import setupKeymaps from './key_handler';
import loadPlugins from './plugins';
import log from './log';

Ipc.on('mstdn:config', (c: Config, a: Account) => {
    const plugins = loadPlugins(c, a);
    log.info('Loaded plugins:', plugins);
    setupKeymaps(c, a);
    document.title = `${document.title} @${a.name}@${a.host}`;
});
