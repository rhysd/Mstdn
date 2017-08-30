declare namespace Menubar {
	type Position
		= "trayLeft"
		| "trayBottomLeft"
		| "trayRight"
		| "trayBottomRight"
		| "trayCenter"
		| "trayBottomCenter"
		| "topLeft"
		| "topRight"
		| "bottomLeft"
		| "bottomRight"
		| "topCenter"
		| "bottomCenter"
		| "center";
	type TrayBounds
		= "trayLeft"
		| "trayBottomLeft"
		| "trayRight"
		| "trayBottomRight"
		| "trayCenter"
		| "trayBottomCenter";
	interface ElectronPositioner {
		move(pos: Position): void;
		calculate(pos: Position, bounds?: TrayBounds): Electron.Point;
	}
	class MenubarApp extends NodeJS.EventEmitter {
		app: Electron.App;
		window: Electron.BrowserWindow;
		tray: Electron.Tray;
		positioner: ElectronPositioner;

		setOption(opt: string, value: any): void;
		getOption(opt: string): any;
		showWindow(): void;
		hideWindow(): void;
	}
	interface MenubarOptions extends Electron.BrowserWindowConstructorOptions {
		dir?: string;
		index?: string;
		tooltip?: string;
		tray?: Electron.Tray;
		icon?: string;
		width?: number;
		height?: number;
		show?: boolean;
		preloadWindow?: boolean;
		alwaysOnTop?: boolean;
		showOnAllWorkspaces?: boolean;
		windowPosition?: Position;
		showDockIcon?: boolean;
		showOnRightClick?: boolean;
		autoHideMenuBar?: boolean;
		webPreferences?: Electron.WebPreferences;
	}
}

declare module "menubar" {
	const ctor: (opts?: Menubar.MenubarOptions) => Menubar.MenubarApp;
	export = ctor;
}
