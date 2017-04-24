import {Config, Account} from '../main/config';
import * as Ipc from './ipc';
import setupKeymaps from './key_handler';
import PluginsLoader from './plugins';

Ipc.on('mstdn:config', (c: Config, a: Account) => {
    const loader = new PluginsLoader(c, a);
    loader.loadAfterAppPrepared();
    setupKeymaps(c, a);
    document.title = `${document.title} @${a.name}@${a.host}`;
});
