import * as path from 'path';
import {Menu, shell, app} from 'electron';

export default function defaultMenu() {
    const template: Electron.MenuItemOptions[] = [
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Edit Config',
                    click() {
                        shell.openItem(path.join(app.getPath('userData'), 'config.json'));
                    }
                },
                {
                    type: 'separator'
                },
                {
                    role: 'undo'
                },
                {
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'cut'
                },
                {
                    role: 'copy'
                },
                {
                    role: 'paste'
                },
                {
                    role: 'pasteandmatchstyle'
                },
                {
                    role: 'delete'
                },
                {
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    role: 'reload'
                },
                {
                    role: 'toggledevtools'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'resetzoom'
                },
                {
                    role: 'zoomin'
                },
                {
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            role: 'window',
            submenu: [
                {
                    role: 'minimize'
                },
                {
                    role: 'close'
                }
            ]
        },
        {
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click () {
                        shell.openExternal('https://github.com/rhysd/Mstdn#readme');
                    }
                },
                {
                    label: 'Search Issues',
                    click () {
                        shell.openExternal('https://github.com/rhysd/Mstdn/issues');
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'Mstdn',
            submenu: [
                {
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    role: 'hide'
                },
                {
                    role: 'hideothers'
                },
                {
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    role: 'quit'
                }
            ]
        });

        (template[1].submenu as Electron.MenuItemOptions[]).push(
            {
                type: 'separator'
            },
            {
                label: 'Speech',
                submenu: [
                    {
                        role: 'startspeaking'
                    },
                    {
                        role: 'stopspeaking'
                    }
                ]
            }
        );

        template[3].submenu = [
            {
                role: 'close'
            },
            {
                role: 'minimize'
            },
            {
                role: 'zoom'
            },
            {
                type: 'separator'
            },
            {
                role: 'front'
            }
        ];
    } else {
        template.unshift(
            {
                label: 'File',
                submenu: [
                    {
                    role: 'quit'
                    }
                ]
            }
        );
    }

    return Menu.buildFromTemplate(template);
}
