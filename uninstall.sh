#!/bin/sh -e
plist_path="localhost.jas.plist"
plist_filename=$(basename "$plist_path")
install_path="/Users/$USER/Library/LaunchAgents/$plist_filename"

echo "uninstalling launchctl plist: $install_path"
# sudo chown $USER "$install_path"
# sudo chmod 644 "$install_path"

launchctl unload -w "$install_path"
rm "$install_path"

echo "to check if it's running, run: sudo launchctl list | grep jas"
echo "to install it again, run 'install.sh'"