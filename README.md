Web-based Desktop Client for [Mastodon][]
=========================================

Features:

- [x] Small window on your menubar (or isolated window)
- [ ] Desktop notification
- [ ] Customizable shortcut keybinds
- [ ] Multi-account

Mastodon is an open source project. So if you want to make a new UI, you can just fork the project,
implement your favorite UI and host it on your place. Then you can participate Mastodon networks from it.

However, Mastodon is a web application. So we can't go out from a browser. So this small tool
provides a way to do it.

## Installation

### Via [npm][]

```
$ npm install -g mstdn
$ open-mstdn-app
```

### As an isolated app

Download a package archive from [Release page][] (not yet), put unarchived app to proper place, and open it.

## Usage

To be written.

## Customization

Mstdn can be customized with JSON config file at `{app dir}/config.json`

The `{app dir}` is:

- `~/Library/Application\ Support/Mstdn` for macOS
- `~/.config/Mstdn` for Linux
- `%APPDATA%\Mstdn` for Windows.

## Multi account

[Mastodon]: https://github.com/tootsuite/mastodon
[npm]: https://www.npmjs.com/package/mstdn
[Release page]: https://github.com/rhysd/Mstdn
