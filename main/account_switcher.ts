import {EventEmitter} from 'events';
import {Menu, MenuItem, ipcMain as ipc} from 'electron';
import log from './log';
import {Account} from './config';

export function partitionForAccount(account: Account) {
    let host = account.host;
    if (account.host.startsWith('https://')) {
        host = host.slice(8);
    } else if (account.host.startsWith('http://')) {
        host = host.slice(7);
    }
    return `persist:mstdn:${account.name}:${host}`;
}

export default class AccountSwitcher extends EventEmitter {
    accounts: Account[];
    current: Account;

    constructor(accounts: Account[]) {
        super();
        const submenu = [] as Electron.MenuItemConstructorOptions[];

        for (const account of accounts.filter(a => a.name !== '')) {
            let name = account.name;
            if (!name.startsWith('@')) {
                name = '@' + name;
            }
            name += '@' + account.host;
            submenu.push({
                label: name,
                type: 'radio',
                checked: false,
                click: () => this.switchTo(account),
            });
        }

        this.accounts = accounts;
        if (accounts.length === 0) {
            return;
        }

        submenu[0].checked = true;
        this.current = accounts[0];

        const item = new MenuItem({
            label: 'Accounts',
            type: 'submenu',
            submenu,
        });

        // Note: Electron's type definitions don't support nullable types yet.
        const menu = Menu.getApplicationMenu() as Electron.Menu | null;
        if (menu !== null) {
            // Insert item before 'Help'
            menu.insert(menu.items.length - 1, item);
            Menu.setApplicationMenu(menu);
        }

        ipc.on('mstdn:next-account' as IpcChannelFromRenderer, this.switchToNext);
        ipc.on('mstdn:prev-account' as IpcChannelFromRenderer, this.switchToPrev);
    }

    switchTo(account: Account) {
        if (this.current.name === account.name && this.current.host === account.host) {
            log.debug('Current account is already @' + account.name);
            return;
        }
        log.debug('Switch to account', account);
        this.emit('switch', account, this.current);
        this.current = account;
    }

    getAccountIndex(account: Account) {
        for (let i = 0; i < this.accounts.length; ++i) {
            const a = this.accounts[i];
            if (a.name === account.name && a.host === account.host) {
                return i;
            }
        }
        return -1;
    }

    switchToNext = () => {
        if (this.accounts.length <= 1) {
            log.debug('Skip switching account: Only one account is registered');
            return;
        }
        let idx = this.getAccountIndex(this.current) + 1;
        if (idx >= this.accounts.length) {
            idx = 0;
        }
        log.debug('Switch to next account');
        this.switchTo(this.accounts[idx]);
    }

    switchToPrev = () => {
        if (this.accounts.length <= 1) {
            log.debug('Skip switching account: Only one account is registered');
            return;
        }
        let idx = this.getAccountIndex(this.current);
        if (idx <= 0) {
            idx = this.accounts.length;
        }
        --idx;
        log.debug('Switch to prev account');
        this.switchTo(this.accounts[idx]);
    }
}
