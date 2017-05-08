import * as path from 'path';
import {remote} from 'electron';
import * as Mousetrap from 'mousetrap';
import * as Ipc from './ipc';
import log from './log';
import PluginsLoader from './plugins';
import {Config, Account} from '../main/config';

function scrollable(pred: (elem: HTMLElement) => void) {
    const scrollables = document.querySelectorAll('.scrollable') as NodeListOf<HTMLElement>;
    if (scrollables.length === 0) {
        log.error('Scrollable element was not found!');
        return
    }
    for (const elem of scrollables) {
        pred(elem);
    }
}

function navigateTo(host: string, path: string) {
    const url = `https://${host}${path}`;
    if (window.location.href === url) {
        log.info('Current URL is already', url);
        return;
    }

    const link = document.querySelector(`a[href="${path}"]`);
    if (link) {
        log.info('Click link by shortcut', path);
        (link as HTMLAnchorElement).click();
    } else {
        log.info('Force navigation by shortcut', path);
        window.location.href = url;
    }
}

const ShortcutActions = {
    'scroll-top': () => {
        scrollable(s => { s.scrollTop = 0; });
    },
    'scroll-bottom': () => {
        scrollable(s => { s.scrollTop = document.body.scrollHeight; });
    },
    'scroll-down': () => {
        scrollable(s => { s.scrollTop += window.innerHeight / 3; });
    },
    'scroll-up': () => {
        scrollable(s => { s.scrollTop -= window.innerHeight / 3; });
    },
    'next-account': () => {
        Ipc.send('mstdn:next-account');
    },
    'prev-account': () => {
        Ipc.send('mstdn:prev-account');
    },
    'open-in-browser': () => {
        remote.shell.openExternal(window.location.href);
    }
} as {[action: string]: () => void};

export default function setupKeymaps(
    config: Config,
    account: Account,
    loader: PluginsLoader,
) {
    const dataDir = config.__DATA_DIR || '/';
    for (const key in config.keymaps) {
        const action = config.keymaps[key];
        if (action.endsWith('.js')) {
            if (config.chromium_sandbox) {
                log.info('Loading external script is limited because Chromium sandbox is enabled. Disable shortcut:', action);
                continue;
            }
            const script = path.join(dataDir, action);

            let plugin: (c: Config, a: Account) => void;
            try {
                plugin = require(script);
            } catch (e) {
                log.error('Error while loading plugin ' + script, e);
                continue;
            }
            Mousetrap.bind(key, e => {
                e.preventDefault();
                log.info('Shortcut:', action);
                try {
                    plugin(config, account);
                } catch (e) {
                    log.error('Failed to run shortcut script ' + script, e);
                }
            });
        } else if (action.startsWith('plugin:')) {
            // Format is 'plugin:{name}:{action}'
            const split = action.split(':').slice(1);
            if (split.length <= 1) {
                log.error('Invalid format keymap. Plugin-defined action should be "plugin:{name}:{action}":', action);
                continue;
            }
            Mousetrap.bind(key, e => {
                loader.runKeyShortcut(e, split[0], split[1]);
            });
        } else if (action.startsWith('/')) {
            Mousetrap.bind(key, e => {
                e.preventDefault();
                navigateTo(account.host, action);
            });
        } else {
            const func = ShortcutActions[action];
            if (!func) {
                log.error('Unknown shortcut action:', action);
                continue;
            }
            Mousetrap.bind(key, e => {
                log.info('Shortcut:', action);
                e.preventDefault();
                func();
            });
        }
    }
}

