#!/bin/bash

set -e

function prepare-app() {
    if [ -d app ]; then
        rm -rf app
    fi
    mkdir app

    npm run build:release

    cp -R bin main renderer resources package.json app/
    cd app/

    npm install --production
    npm uninstall electron
    npm prune
    cd -
}

function pack-app() {
    local version=$(./bin/cli.js --version)
    local electron_version=$(electron --version)
    electron_version=${electron_version#v}

    electron-packager ./app --platform=darwin --arch=x64 "--app-copyright=copyright (c) 2017 rhysd" --app-version=$version --build-version=$version --icon=./resources/icon.icns --electron-version=$electron_version
    electron-packager ./app --platform=linux --arch=all "--app-copyright=copyright (c) 2017 rhysd" --app-version=$version --build-version=$version --icon=./resources/icon.ico --electron-version=$electron_version
    electron-packager ./app --platform=win32 --arch=all "--app-copyright=copyright (c) 2017 rhysd" --app-version=$version --build-version=$version --icon=./resources/icon.ico --electron-version=$electron_version --version-string=$version
}

function make-dist() {
    if [ -d dist ]; then
        rm -rf dist
    fi
    mkdir dist
    local version="$(./bin/cli.js --version)"
    for dir in `ls -1 | grep '^Mstdn-'`; do
        mv "$dir/LICENSE" "$dir/LICENSE.electron"
        cp LICENSE README.md "$dir"
        zip --symlinks "dist/${dir}-${version}.zip" -r "$dir"
    done
    rm -r Mstdn-*
    open dist
}

prepare-app
pack-app
make-dist
