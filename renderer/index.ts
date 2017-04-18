import * as Mousetrap from 'mousetrap';
import {Config, Account} from '../main/config';
import * as Ipc from './ipc';
import log from './log';

function scrollable() {
    const scrollable = document.querySelector('.scrollable');
    if (!scrollable) {
        log.error('Scrollable element was not found!');
        return {scrollTop: 0};
    }
    return scrollable;
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
} as {[action: string]: () => void};

function setupKeybinds(keybinds: {[key: string]: string}, host: string) {
    for (const key in keybinds) {
        const action = keybinds[key];
        if (action.startsWith('/')) {
            Mousetrap.bind(key, e => {
                const url = `https://${host}${action}`;
                log.info('URL Shortcut:', url);
                e.preventDefault();
                window.location.href = url;
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

let config: Config | null = null;

Ipc.on('mstdn:config', (c: Config, a: Account) => {
    config = c;
    const host = a.host;
    setupKeybinds(config.keymaps, host);
});
