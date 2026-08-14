#!/bin/sh
# JAS launcher for macOS and Linux. Finds a Node runtime (see
# server/find-node.sh), installs dependencies if they are missing, and starts
# the server.
set -e

# Resolve this script's real directory, following symlinks, without relying on
# `readlink -f` (missing on older macOS).
script=$0
while [ -L "$script" ]; do
  link=$(readlink "$script")
  case $link in
    /*) script=$link ;;
    *) script=$(dirname "$script")/$link ;;
  esac
done
JAS_DIR=$(cd "$(dirname "$script")" && pwd)
cd "$JAS_DIR"

echo 'JAS -- Javascript App Server -- starting'

. "$JAS_DIR/server/find-node.sh"

if [ -z "$node_bin" ]; then
  jas_no_node_message
  exit 1
fi
jas_check_node_version || exit 1

# Releases and the git checkout both ship node_modules, so this only runs for
# an incomplete copy of the project.
if [ ! -d "$JAS_DIR/node_modules" ]; then
  echo 'JAS -- dependencies missing, running npm install'
  if ! "$npm_bin" install --omit=dev --no-audit --no-fund; then
    echo "JAS: npm install failed. Install dependencies manually with 'npm install'." >&2
    exit 1
  fi
fi

exec "$node_bin" "$JAS_DIR/server/jas.js" "$@"
