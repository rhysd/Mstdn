Web-based Desktop Client for [Mastodon][]
=========================================

<img src="https://github.com/rhysd/ss/blob/master/Mstdn/main.png?raw=true" width="484" alt="screen shot"/>

Mstdn is a desktop application based on mobile version Mastodon page and [Electron][] framework.
It basically uses Mastodon's mobile page and provides various desktop application features
(such as desktop notification, keybinds, multi-account support).

Features:

- [x] Small window on your menubar (or isolated normal window)
- [x] Desktop notification
- [x] Customizable shortcut keybinds
- [x] Multi-account (switching among accounts)

Mastodon is an open source project. So if you want to make a new UI, you can just fork the project,
implement your favorite UI and host it on your place. Then you can participate Mastodon networks from it.

However, Mastodon is a web application. So we can't go out from a browser. So this small tool
provides a way to do it.

## Installation

### Via [npm][]

```
$ npm install -g mstdn
```

### As an isolated app

Download a package archive from [Release page][], put unarchived app to proper place, and open it.

## Usage

If you installed this app via npm, below command is available to start app.

```
$ open-mstdn-app
```

At first, a dialog which recommends to write up config is shown and JSON config file will be open in your editor.
You need to fill up `"name"` and `"host"` keys in first element of `"accounts"`.

Then please try to start app again. Usage is the same as web client on mobile devices.
Some shortcuts are available by default (please see below 'Customization' section).

Supported platforms are macOS (confirmed with 10.12), Linux (hopefully) and Windows (hopefully).

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
Default value is `"CmdOrCtrl+Shift+S"`. If you want to disable, please set empty string or `null`. 

### `icon_color`

Color of icon in menubar. `"black"` or `"white"` can be specified.

### `always_on_top`

When this value is set to `true`, the window won't be hidden if it loses a focus. Default value is `false`.

### `normal_window`

When this value is set to `true`, application will be launched as a normal window application.
If menu bar behavior does not work for you, please use set this value to `true` to avoid it.
Default value is `false` on macOS or Linux, `true` on Windows because window position is broken in some version of Windows.

### `zoom_factor`

Font zoom factor in application. It should be positive number. For example, `0.7` means `70%` font zooming.
Default font size is a bit bigger because the UI is originally for mobile devices. So default value is `0.9`.

### `accounts`

Array of your accounts. An element should has `"name"`, `"host"` and `"default_page"` keys.
`"name"` represents your screen name. `"host"` represents a host part of URL of your mastodon instance.
`"default_page"` is a page firstly shown.

You need to write up this config at first.

### `keymaps`

Object whose key is a key sequence and whose value is an action name.

| Action Name     | Description                     | Default Key |
|-----------------|---------------------------------|-------------|
| `scroll-down`   | Scroll down window              | `j`         |
| `scroll-up`     | Scroll up window                | `k`         |
| `scroll-top`    | Scroll up to top of window      | `i`         |
| `scroll-bottom` | Scroll down to bottom of window | `m`         |
| `next-account`  | Switch to next account          | N/A         |
| `prev-account`  | Switch to previous account      | N/A         |

If an action name starts with `/`, it will navigate to the path. For example,
if you set `"/web/timelines/home"` to some key shortcut and you input the key,
browser will navigate page to `https://{your host}/web/timelines/home`.

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

If you set multiple accounts to `accounts` array in `config.json`, `Accounts` menu item will appear in application menu.

![multi account menu item](https://github.com/rhysd/ss/blob/master/Mstdn/multi-account.png?raw=true)

It will show the list of your account. Check mark is added for current user.
When you click menu item of non-current user, application window will be recreated and switch page to the account.

[Mastodon]: https://github.com/tootsuite/mastodon
[npm]: https://www.npmjs.com/package/mstdn
[Release page]: https://github.com/rhysd/Mstdn/releases
[Electron]: electron.atom.io
