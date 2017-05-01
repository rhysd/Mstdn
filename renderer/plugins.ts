import * as path from 'path';
import {Config, Account} from '../main/config';
import log from './log';

interface Plugin {
    keymaps?: {
        [action: string]: (e: KeyboardEvent, c: Config, a: Account) => void;
    };
    preload?(c: Config, a: Account): void;
}
interface Plugins {
    [module_path: string]: Plugin;
}

export default class PluginsLoader {
    preloads: Plugins;
    loaded: boolean;

    constructor(private config: Config, private account: Account) {
        this.loaded = false;
        this.preloads = {};

        if (config.chromium_sandbox) {
            log.info('Chromium sandbox is enabled. Plugin is disabled.');
            return;
        }

        const dir_base = path.join(config.__DATA_DIR!, 'node_modules');
        for (const plugin of this.account.plugins || []) {
            const plugin_path = path.join(dir_base, `mstdn-plugin-${plugin}`);
            try {
                this.preloads[plugin_path] = require(plugin_path) as Plugin;
            } catch (e) {
                log.error(`Failed to load plugin ${plugin_path}:`, e);
            }
        }
    }

    loadAfterAppPrepared() {
        if (Object.keys(this.preloads).length === 0) {
            log.info('No Plugin found. Skip loading');
            this.loaded = true;
            return;
        }

        return new Promise<void>(resolve => {
            // In order not to prevent application's initial loading, load preload plugins
            // on an idle callback.
            window.requestIdleCallback(() => {
                log.debug('Start loading plugins', this.preloads);
                if (this.tryLoading()) {
                    return resolve();
                }
                this.observeAppPrepared(this.tryLoading).then(resolve);
            });
        });
    }

    observeAppPrepared(callback: () => void) {
        // TODO:
        // Make an instance of MutationObserver to observe React root.
        // But it may be unnecessary because application shell is rendered
        // in server side.
        return Promise.resolve(callback());
    }

    tryLoading = () => {
        if (document.querySelector('[data-react-class="Mastodon"]') === null) {
            log.info('Root element of react app was not found. App seems not to be loaded yet.');
            return false;
        }

        for (const key in this.preloads) {
            const f = this.preloads[key].preload;
            if (!f) {
                log.info('Plugin does not have preload function. Skipped:', key);
                continue;
            }
            try {
                f(this.config, this.account);
            } catch (e) {
                log.error(`Error while loading plugin '${key}':`, e);
            }
        }

        log.info('Plugins were loaded:', this.preloads);
        return true;
    }

    findPluginByName(name: string): Plugin | null {
        const pluginName = `mstdn-plugin-${name}`;
        for (const p in this.preloads) {
            if (p.endsWith(pluginName)) {
                return this.preloads[p];
            }
        }
        return null;
    }

    runKeyShortcut(event: KeyboardEvent, name: string, action: string) {
        const plugin = this.findPluginByName(name);
        if (plugin === null) {
            log.error(`While trying to execute key shortcut '${action}', plugin for '${name}' not found:`, this.preloads);
            return;
        }

        const f = (plugin.keymaps || {})[action];
        if (!f) {
            log.error(`There is no key shortcut action '${action}' in plugin '${name}'`, plugin);
            return;
        }

        try {
            f(event, this.config, this.account);
        } catch (e) {
            log.error(`Error while executing plugin-defined key short action: ${action} with plugin '${name}'`, e);
        }
    }
}
