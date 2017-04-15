import * as Mousetrap from 'mousetrap';
import {Config} from '../main/config';
import * as Ipc from './ipc';
import log from './log';

Ipc.on('mstdn:config', (config: Config) => {
    log.info('FOOOOOO', config);
});


