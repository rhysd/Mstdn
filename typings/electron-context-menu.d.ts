declare namespace ElectronContextMenu {
    interface Options {
        window?: Electron.BrowserWindow | Electron.WebViewElement;
        prepend?: (params: any, win: Electron.BrowserWindow) => Electron.MenuItem[];
        append?: (...args: any[]) => any;
        showInspectElement?: boolean;
        labels?: {
            cut: string;
            copy: string;
            paste: string;
            save: string;
            copyLink: string;
            inspect: string;
        };
        shouldShowMenu?: (event: Event, params: any) => boolean;
    }
}
declare module 'electron-context-menu' {
    const create: (options?: ElectronContextMenu.Options) => void;
    export = create;
}
