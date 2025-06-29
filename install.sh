#!/bin/sh -e
echo 'JAS - installing...'
plist_filename="localhost.jas.plist"
install_path="/Users/$USER/Library/LaunchAgents/$plist_filename"

rm -f "server/$plist_filename"
cp "server/template-$plist_filename" "server/$plist_filename"
sed -i '' "s|JAS_HOME|$PWD|g" "server/localhost.jas.plist"
cp -f "server/$plist_filename" "$install_path"
# sudo chown $USER "$install_path"
# sudo chmod 644 "$install_path"

launchctl unload -w "$install_path"
launchctl load -w "$install_path"


echo 'JAS - COMPLETE.'
# echo "- to check if it's running, run: sudo launchctl list | grep jas"
# echo "- to uninstall, run: sudo launchctl unload \"$install_path\""