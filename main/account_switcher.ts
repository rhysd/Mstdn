import {EventEmitter} from 'events';
import {Menu, MenuItem} from 'electron';
import log from './log';
import {Account} from './config';

export function partitionForAccount(account: Account) {
    return `persist:mstdn:${account.name}:${account.host}`;
}

export default class AccountSwitcher extends EventEmitter {
    accounts: Account[];
    current: Account;

    constructor(private win: Electron.BrowserWindow, accounts: Account[]) {
        super();
        const submenu = [] as Electron.MenuItemOptions[];

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
                click: () => this.switchAccountTo(account),
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

        const menu = Menu.getApplicationMenu();
        // Insert item before 'Help'
        menu.insert(menu.items.length - 1, item);
        Menu.setApplicationMenu(menu);
    }

    switchAccountTo(account: Account) {
        if (this.current.name === account.name && this.current.host === account.host) {
            log.debug('Current account is already @' + account.name);
            return;
        }
        log.debug('Switch to account', account);
        this.emit('will-switch', account);

        log.error('TODO: Switch partition');

        this.win.webContents.send('mstdn:change-account', account);
        this.emit('did-switch', account);
        this.current = account;
    }
}
