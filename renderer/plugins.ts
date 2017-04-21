import * as path from 'path';
import {Config, Account} from '../main/config';
import r from './require';
import log from './log';

type Plugin = (c: Config, a: Account) => void;
interface Plugins {
    [module_path: string]: Plugin;
}

export default function loadPlugins(config: Config, account: Account): Plugins {
    const ret = {} as Plugins;
    if (config.chromium_sandbox) {
        log.info('Chromium sandbox is enabled. Preload plugin is disabled.');
        return ret;
    }
    const dir_base = path.join(config.__DATA_DIR!, 'node_modules');
    for (const plugin of config.preload || []) {
        const plugin_path = path.join(dir_base, `mstdn-preload-${plugin}`);
        try {
            const preloadFunc = r(plugin_path) as Plugin;
            preloadFunc(config, account);
            ret[plugin_path] = preloadFunc;
        } catch (e) {
            log.error(`Failed to load plugin ${plugin_path}:`, e);
        }
    }
    return ret;
}
