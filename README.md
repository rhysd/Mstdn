Web-based Desktop Client for [Mastodon][]
=========================================
[![npm version][npm version badge]][npm]

Mstdn is a desktop application based on mobile version Mastodon page and [Electron][] framework.
It basically uses Mastodon's mobile page and provides various desktop application features
(such as desktop notification, keybinds, multi-account support).

<img src="https://github.com/rhysd/ss/blob/master/Mstdn/main.png?raw=true" width="484" alt="screen shot"/>

Features:

- [x] Small window on your menubar (or isolated normal window)
- [x] Desktop notification
- [x] Customizable (and pluggable) shortcut keybinds
- [x] Multi-account (switching among accounts)
- [x] User CSS
- [x] Plugin architecture based on Node.js and Electron APIs

Mastodon is an open source project. So if you want to make a new UI, you can just fork the project,
implement your favorite UI and host it on your place. Then you can participate Mastodon networks from it.

However, Mastodon is a web application. So we can't go out from a browser. This small tool provides
the ability to Mastodon page in desktop application window out of browser.

## Installation

### Via [npm][]

```
$ npm install -g mstdn
```

### Via [yarn][]

```
$ yarn global add mstdn --prefix /usr/local
```

### As an isolated app

Download a package archive from [Release page][], put unarchived app to proper place, and open it.

## Usage

If you installed this app via npm or yarn, below command is available to start app.

```
$ open-mstdn-app
```

At first, a dialog which recommends to write up config is shown and JSON config file will be open in your editor.
You need to fill up `"name"` and `"host"` keys in first element of `"accounts"`. Please see below `accounts` section
to know how to configure the option.

Then please try to start app again. Usage is the same as web client on mobile devices.
Some shortcuts are available by default (please see below 'Customization' section).

Supported platforms are macOS (confirmed with 10.12), Linux (hopefully) and Windows (confirmed with Windows 8.1).

There are two window modes 'menubar mode' and 'normal window mode' in this app. You can switch
them with `"normal_window"` option (please see below 'Customization' section for how to configure it).

- **menubar mode**: Window is attached to menubar. You can toggle the window by clicking menubar icon or typing hot key.
Advantage of this mode is that app does not fill any workspace. You can see your timeline on demand anytime.
This mode is default on macOS or Linux.
- **normal window mode**: App starts with a normal window like a separated browser window. You can put/resize window
as you like in your workspace.

In both modes, app remembers the size and location of its window. So you need to specify window size
(or location in normal window mode) only once.

## Customization

Mstdn can be customized with JSON config file at `{app dir}/config.json`

The `{app dir}` is:

- `~/Library/Application\ Support/Mstdn` for macOS
- `~/.config/Mstdn` for Linux
- `%APPDATA%\Mstdn` for Windows.

The JSON file can contain below key-values:

### `hot_key`

`hot_key` is a key sequence to toggle application window. The shortcut key is defined globally.
The format is a [Electron's accelerator](https://github.com/electron/electron/blob/master/docs/api/accelerator.md).
Please see the document to know how to configure this value.
Default value is `"CmdOrCtrl+Shift+Enter"`. If you want to disable, please set empty string or `null`. 

### `icon_color`

Color of icon in menubar. `"black"` or `"white"` can be specified.

### `always_on_top`

When this value is set to `true`, the window won't be hidden if it loses a focus. Default value is `false`.

### `normal_window`

When this value is set to `true`, application will be launched as a normal window application.
If menu bar behavior does not work for you, please use set this value to `true` to avoid it.
Default value is `false` on macOS or Linux, `true` on Windows because window position is broken
in some version of Windows.

### `hide_menu`

When this value is set to `true`, the application will be launched with the
menubar hidden, assuming `normal_window` is also true. When set to `false`, the
menubar will be visible on launch. Default value is `false`.

On Windows, typing Alt key shows the hidden menubar.

### `zoom_factor`

Font zoom factor in application. It should be positive number. For example, `0.7` means `70%` font zooming.
Default font size is a bit bigger because the UI is originally for mobile devices. So default value is `0.9`.

### `accounts`

Array of your accounts. An element should has `"name"`, `"host"` and `"default_page"` keys.

`"name"` represents your screen name. If your name is `@foo` then please specify `"foo"` for it.

`"host"` represents a host part of URL of your mastodon instance. If you belong to
`https://mastodon.social`, please specify `mastodon.social`. `https://` is not necessary.

`"default_page"` is a path of page firstly shown. If `/web/notifications` is specified,
`https://{your host}/web/notifications` will be open on app starting.

You need to write up this config at first.

### `chromium_sandbox`

If `true` is specified, Chromium's native sandbox is enabled (and default value is `true`).
Sandbox provides some OS level security protection such as resource access control like tabs
in Chromium. However, sandbox also blocks plugins for Electron application.

If `false` is specified, you can use some advanced features (user CSS and key shortcut plugin).
Before setting `false` to this value, please read and understand [sandbox documentation in Electron repo][sandbox doc]
to know what you're doing.

Please note that this sandbox feature is different from Node.js integration in Electron. Node.js
integration is always disabled.

### `keymaps`

Object whose key is a key sequence and whose value is an action name.

| Action Name       | Description                     | Default Key |
|-------------------|---------------------------------|-------------|
| `scroll-down`     | Scroll down window              | `j`         |
| `scroll-up`       | Scroll up window                | `k`         |
| `scroll-top`      | Scroll up to top of window      | `i`         |
| `scroll-bottom`   | Scroll down to bottom of window | `m`         |
| `next-account`    | Switch to next account          | N/A         |
| `prev-account`    | Switch to previous account      | N/A         |
| `open-in-browser` | Open current page in browser    | N/A         |

If an action name starts with `/`, it will navigate to the path. For example,
if you set `"/web/timelines/home"` to some key shortcut and you input the key,
browser will navigate page to `https://{your host}/web/timelines/home`.

Below is a default path actions. They are corresponding the position of tab items.

| Path                          | Description                       | Default Key |
|-------------------------------|-----------------------------------|-------------|
| `/web/statuses/new`           | Move to 'make a new toot' page    | `1`         |
| `/web/timelines/home`         | Move to 'home timeline' page      | `2`         |
| `/web/notifications`          | Move to 'notifications' page      | `3`         |
| `/web/timelines/public/local` | Move to 'local timeline' page     | `4`         |
| `/web/timelines/public`       | Move to 'federated timeline' page | `5`         |
| `/web/getting-started`        | Move to 'getting started' page    | `6`         |

If an action name ends with `.js`, it will run key shortcut plugin (please see below
'Key Shortcut Plugin' section). This plugin feature requires `"chromium_sandbox": true`.

By default, some key shortcuts for tab items are set in addition to above table.

<details>
<summary> Example of configuration </summary>
<pre><code>
{
  "hot_key": "F8",
  "icon_color": "black",
  "always_on_top": false,
  "normal_window": false,
  "zoom_factor": 0.9,
  "chromium_sandbox": true,
  "accounts": [
    {
      "name": "Linda_pp",
      "host": "mstdn.jp",
      "default_page": "/web/timelines/home"
    },
    {
      "name": "inudog",
      "host": "mastodon.social",
      "default_page": "/web/timelines/home"
    }
  ],
  "keymaps": {
    "1": "/web/statuses/new",
    "2": "/web/timelines/home",
    "3": "/web/notifications",
    "4": "/web/timelines/public/local",
    "5": "/web/timelines/public",
    "6": "/web/getting-started",
    "ctrl+1": "/web/statuses/new",
    "ctrl+2": "/web/timelines/home",
    "ctrl+3": "/web/notifications",
    "ctrl+4": "/web/timelines/public/local",
    "ctrl+5": "/web/timelines/public",
    "ctrl+6": "/web/getting-started",
    "j": "scroll-down",
    "k": "scroll-up",
    "i": "scroll-top",
    "m": "scroll-bottom",
    "n": "next-account",
    "p": "prev-account"
  }
}
</code></pre>
</details>

## Multi account

If you set multiple accounts to `accounts` array in `config.json`, `Accounts` menu item will appear
in application menu.

![multi account menu item](https://github.com/rhysd/ss/blob/master/Mstdn/multi-account.png?raw=true)

It will show the list of your account. Check mark is added for current user.
When you click menu item of non-current user, application window will be recreated and switch page
to the account.

## Key Shortcut Plugin

By specifying JavaScript file to action name in `keymaps` of `config.json`, you can write your
favorite behavior with JavaScript directly. Please note that `"chromium_sandbox" : true`
is also required (if you don't know what happens with `"chromium_sandbox" : true`, please read
above config section).

```json
{
    ...

    "chromium_sandbox": false,

    ...

    "keymaps": {
        "r": "hello.js"
    }
}
```

The script file path is a relative path from your `Mstdn` application directory. For example,
Specifying `hello.js` will run `/Users/You/Application Support/Mstdn/hello.js` on Mac.

The plugin script MUST export one function. Function receives configuration object and current
account object as its parameters. So above `hello.js` would look like:

```js
module.exports = function (config, account) {
    alert('Hello, ' + account.name);
}
```

With above example config, typing `r` will show 'Hello, {your name}' alert dialog. You can use any
DOM APIs, Node.js's standard libraries and Electron APIs in plugin script.

## User CSS

When `user.css` is put in your `Mstdn` application directory, it will be loaded automatically.
To enable this feature, `"chromium_sandbox" : true` is also required (if you don't know what happens
with `"chromium_sandbox" : true`, please read above config section).

For example, below `/Users/You/Application Support/Mstdn/user.css` will change font color to red on Mac.

```css
body {
  color: red !important;
}
```

## Plugin (experimental)

You can make a Node.js package which is run inner mastodon page.

Plugin is enabled if `chromium_sandbox` option is set to `false`. Please read above
configuration section before using any plugin.

### How to make a plugin

Create `node_modules` directory in your application directory at first. And then, please make
`mstdn-plugin-hello` directory. It consists a node package.

Package name must start with `mastdn-plugin-`.

Make `package.json` manually or by `$ npm init` in the directory.

```json
{
  "name": "mstdn-plugin-hello",
  "version": "0.0.0",
  "description": "Sample plugin of Mstdn.app",
  "main": "index.js",
  "author": "Your name",
  "license": "Some license"
}
```

And make `index.js` as below:

```javascript
module.exports = {
    preload(config, account) {
        console.log('Hello from plugin!', config, account);
    }
};
```

Package must export one object.
If the object has a function as a value of `preload` key, it will be called at page being loaded.
The function receives two parameters `config` and `account`.

By defining `keymaps` key you can define plugin-defined key shortcut action.

```javascript
module.exports = {
    preload(config, account) {
        console.log('Hello from plugin!', config, account);
    },
    keymaps: {
        'alert-hello'(event, config, account) {
            event.preventDefault();
            alert('Hello, ' + account.name);
        }
    }
};
```

The object of `keymaps` has keymap action name (key) and its handler (value). Here 'alert-hello'
key shortcut action is defined. Key shortcut handler takes 3 arguments. `config` and `account`
is the same as `preload`'s. `event` is a `KeyboardEvent` browser event on the key shortcut
being called. You can cancel default event behavior by `.preventDefault()` method.

User can specify the key shortcut as `plugin:{plugin name}:{action name}`. In above example,
`plugin:hello:alert-hello` is available in `keymaps` section in config.json.

Note that you can use below APIs in the script.

- [Node.js standard libraries][] via `require` (e.g. `require('fs')`)
- Dependant node packages listed in `package.json` of the plugin
- [Electron Renderer APIs][Electron APIs]
- All Web APIs on browser (including DOM API)

#### !!! Security Notice !!!

Do not leak Node.js stuff to global namespace like below.

```javascript
// Never do things like this!
window.my_require = require;
```

### How to use

If you didn't try above 'How to make' section, please install plugin package at first.
Below will install 'hello' plugin to `{app directory}/node_modules/mstdn-plugin-hello`.

```
$ cd {Your application directory}
$ npm install mstdn-plugin-hello
```

And then write what plugin should be loaded to `"plugins"` section of your account in `config.json`.
`"hello"` should be added to the list.
If listed plugin defines some keymaps, you can specify it in `keymaps` section with
`plugin:{name}:{action}` format.

```json
{
    ...

    "accounts": [
        {
            ...

            "plugins": [
                "hello"
            ]
        }
    ],
    "keymaps": {
        ...

        "ctrl+h": "plugin:hello:alert-hello"
    },

    ...
}
```

Note that you can enable different plugin for each your accounts.

Finally open Mstdn.app and see DevTools via [Menu] -> [View] -> [Developper Tools] -> console.
If window is too small to see DevTools, please make window size bigger.

In console, the message 'Hello from plugin!', config information and account information should be output.

### List of Plugins

To be made

## How to Debug

By setting `NODE_ENV` environment variable to `development`, Mstdn will start in debug mode.

In debug mode, app outputs all logs to stdout and opens DevTools for a page rendered in a window
automatically. You can also see logs in 'console' tab of DevTools for debugging renderer process.

```sh
# If you installed this app via npm or yarn
$ NODE_ENV=development open-mstdn-app

# Package on macOS
$ NODE_ENV=development /path/to/Mstdn.app/Contents/MacOS/Mstdn

# Package on Linux
$ NODE_ENV=development /path/to/Mstdn-linux-xxx-x.y.z/Mstdn

# Package on cmd.exe on Windows
$ set NODE_ENV=development
$ \path\to\Mstdn-win32-xxx-x.y.z\Mstdn.exe
```

## Contact to the Author

Please feel free to make an issue on GitHub or mention on Mastodon/Twitter.

- [@Linda\_pp@mstdn.jp](https://mstdn.jp/@Linda_pp) (Japanese account. English is also OK)
- [@inudog@mastodon.social](https://mastodon.social/@inudog) (English account)

[Mastodon]: https://github.com/tootsuite/mastodon
[npm]: https://www.npmjs.com/package/mstdn
[yarn]: https://yarnpkg.com/en/package/mstdn
[Release page]: https://github.com/rhysd/Mstdn/releases
[Electron]: electron.atom.io
[sandbox doc]: https://github.com/electron/electron/blob/master/docs/api/sandbox-option.md
[npm version badge]: https://badge.fury.io/js/mstdn.svg
[Node.js standard libraries]: https://nodejs.org/api/
[Electron APIs]: https://electron.atom.io/docs/api/
