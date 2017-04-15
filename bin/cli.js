#! /usr/bin/env node

const child_process = require('child_process');
const path = require('path');
const electron = require('electron');

const args = [path.join(__dirname, '..')];

if (process.argv.indexOf('--version') >= 0) {
    process.stdout.write(require('../package.json').version + '\n');
} else if (process.env.NODE_ENV === 'development' || process.argv.indexOf('--no-detach') !== -1) {
    child_process.spawn(electron, args, {
        stdio: 'inherit'
    });
} else {
    child_process.spawn(electron, args, {
        stdio: 'ignore',
        detached: true
    }).unref();
}
