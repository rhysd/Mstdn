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
} as {[action: string]: () => void};

function setupKeybinds(keybinds: {[key: string]: string}, host: string) {
    for (const key in keybinds) {
        const action = keybinds[key];
        if (action.startsWith('/')) {
            Mousetrap.bind(key, e => {
                e.preventDefault();
                navigateTo(host, action);
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
    setupKeybinds(config.keymaps, a.host);
});
