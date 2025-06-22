#!/bin/bash
echo 'JAS -- Javascript App Server -- starting'
cd "$( dirname -- "$( readlink -f -- "$0"; )"; )"
./server/node/v20.15.0-darwin-x64/bin/node ./server/jas.js