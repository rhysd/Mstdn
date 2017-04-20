import {Config, Account} from '../main/config';
import * as Ipc from './ipc';
import setupKeymaps from './key_handler';

Ipc.on('mstdn:config', (c: Config, a: Account) => {
    setupKeymaps(c, a);
    document.title = `${document.title} @${a.name}@${a.host}`;
});
