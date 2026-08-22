#!/bin/sh
# Registers JAS to start automatically on login: a launchd agent on macOS,
# a systemd user service on Linux. Run ./scripts/uninstall.sh to undo.
set -e

JAS_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$JAS_DIR"

echo 'JAS - installing...'
mkdir -p server/logs

# Service managers start JAS with a minimal PATH that version managers (nvm,
# fnm, asdf) are not part of, so the Node found now is recorded in the service
# definition rather than looked up again at login.
. "$JAS_DIR/server/find-node.sh"
if [ -z "$node_bin" ]; then
  jas_no_node_message
  exit 1
fi
jas_check_node_version || exit 1
case $node_bin in
  /*) ;;
  *) node_bin=$(cd "$(dirname "$node_bin")" && pwd)/$(basename "$node_bin") ;;
esac
echo "- using Node: $node_bin"

render_template() {
  sed -e "s|JAS_HOME|$JAS_DIR|g" -e "s|JAS_NODE_PATH|$node_bin|g" "$1" > "$2"
}

case $(uname -s) in
  Darwin)
    plist_filename="localhost.jas.plist"
    install_path="$HOME/Library/LaunchAgents/$plist_filename"

    render_template "server/template-$plist_filename" "server/$plist_filename"
    mkdir -p "$HOME/Library/LaunchAgents"
    cp -f "server/$plist_filename" "$install_path"

    launchctl unload -w "$install_path" 2> /dev/null || true
    launchctl load -w "$install_path"

    echo "JAS - COMPLETE. Registered launchd agent: $install_path"
    echo "- to check if it's running, run: launchctl list | grep jas"
    ;;

  Linux)
    unit_filename="jas.service"
    unit_dir="$HOME/.config/systemd/user"
    install_path="$unit_dir/$unit_filename"

    if ! command -v systemctl > /dev/null 2>&1; then
      echo "JAS: systemctl not found. Start JAS with ./jas.sh, or register it with" >&2
      echo "whatever init system this machine uses." >&2
      exit 1
    fi

    mkdir -p "$unit_dir"
    render_template "server/template-$unit_filename" "$install_path"

    systemctl --user daemon-reload
    systemctl --user enable --now "$unit_filename"

    # Without lingering, the service stops when the last session for this user
    # ends and does not come back until the next login.
    loginctl enable-linger "$(id -un)" 2> /dev/null \
      || echo "- note: could not enable lingering; JAS will only run while you are logged in."

    echo "JAS - COMPLETE. Registered systemd user service: $install_path"
    echo "- to check if it's running, run: systemctl --user status jas"
    ;;

  *)
    echo "JAS: auto-start is not supported on $(uname -s) by this script." >&2
    echo "On Windows, run scripts\\install.cmd instead. Otherwise start JAS with ./jas.sh." >&2
    exit 1
    ;;
esac
