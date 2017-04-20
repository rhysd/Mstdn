import * as path from 'path';
import * as Mousetrap from 'mousetrap';
import * as Ipc from './ipc';
import log from './log';
import {Config, Account} from '../main/config';
import r from './require';
const shell = r('electron').remote.shell;

function scrollable() {
    const scrollable = document.querySelector('.scrollable');
    if (!scrollable) {
        log.error('Scrollable element was not found!');
        return {scrollTop: 0};
    }
    return scrollable;
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
        scrollable().scrollTop = 0;
    },
    'scroll-bottom': () => {
        scrollable().scrollTop = document.body.scrollHeight;
    },
    'scroll-down': () => {
        scrollable().scrollTop += window.innerHeight / 3;
    },
    'scroll-up': () => {
        scrollable().scrollTop -= window.innerHeight / 3;
    },
    'next-account': () => {
        Ipc.send('mstdn:next-account');
    },
    'prev-account': () => {
        Ipc.send('mstdn:prev-account');
    },
    'open-in-browser': () => {
        shell.openExternal(window.location.href);
    }
} as {[action: string]: () => void};

export default function setupKeymaps(
    config: Config,
    account: Account,
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

