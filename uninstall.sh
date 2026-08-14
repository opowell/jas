#!/bin/sh
# Removes the auto-start registration created by install.sh. Project files are
# left untouched.
set -e

JAS_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$JAS_DIR"

case $(uname -s) in
  Darwin)
    plist_filename="localhost.jas.plist"
    install_path="$HOME/Library/LaunchAgents/$plist_filename"

    echo "uninstalling launchd agent: $install_path"
    launchctl unload -w "$install_path" 2> /dev/null || true
    rm -f "$install_path"

    echo "to check if it's still running, run: launchctl list | grep jas"
    ;;

  Linux)
    unit_filename="jas.service"
    install_path="$HOME/.config/systemd/user/$unit_filename"

    echo "uninstalling systemd user service: $install_path"
    if command -v systemctl > /dev/null 2>&1; then
      systemctl --user disable --now "$unit_filename" 2> /dev/null || true
    fi
    rm -f "$install_path"
    if command -v systemctl > /dev/null 2>&1; then
      systemctl --user daemon-reload
    fi

    echo "to check if it's still running, run: systemctl --user status jas"
    ;;

  *)
    echo "JAS: nothing to uninstall on $(uname -s). On Windows, run uninstall.cmd." >&2
    exit 1
    ;;
esac

echo "to install it again, run './install.sh'"
