#!/bin/sh -e
plist_path="./server/localhost.jas.plist"
plist_filename=$(basename "$plist_path")
install_path="/Users/op/Library/LaunchAgents/$plist_filename"

echo "uninstalling launchctl plist: $install_path"

launchctl unload "$install_path"