#!/bin/bash
timestamp=$(date +%s)
echo 'jasper v1.0 ' "$timestamp"
cd "$( dirname -- "$( readlink -f -- "$0"; )"; )"
./server/node/v20.15.0-darwin-x64/bin/node ./server/server.js