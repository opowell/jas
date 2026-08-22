# Shared Node.js lookup for jas.sh and scripts/install.sh, on macOS and Linux.
# Sourced, not executed. Expects $JAS_DIR (the project root) to be set, and
# sets node_bin and npm_bin, leaving node_bin empty when nothing suitable is
# found. Order of preference:
#   1. a Node bundled under server/node (as shipped in the release archives)
#   2. $JAS_NODE, if set
#   3. the `node` on PATH

REQUIRED_NODE_MAJOR=22

case $(uname -s) in
  Darwin) jas_platform=darwin ;;
  Linux) jas_platform=linux ;;
  *) jas_platform=$(uname -s | tr '[:upper:]' '[:lower:]') ;;
esac
case $(uname -m) in
  x86_64 | amd64) jas_arch=x64 ;;
  arm64 | aarch64) jas_arch=arm64 ;;
  *) jas_arch=$(uname -m) ;;
esac

node_bin=
npm_bin=npm

# An unmatched glob expands to the literal pattern, which the -x test rejects.
for dir in "$JAS_DIR"/server/node/*-"$jas_platform"-"$jas_arch"; do
  if [ -x "$dir/bin/node" ]; then
    node_bin="$dir/bin/node"
    npm_bin="$dir/bin/npm"
    break
  fi
done

if [ -z "$node_bin" ] && [ -n "$JAS_NODE" ]; then
  node_bin=$JAS_NODE
fi
if [ -z "$node_bin" ] && command -v node > /dev/null 2>&1; then
  # Resolved to an absolute path so it stays valid for service managers, which
  # start JAS with a minimal PATH that version managers are not part of.
  node_bin=$(command -v node)
fi

# Last resort: any bundled runtime that actually runs, whatever its folder is
# named. `uname -m` reports the architecture of the *calling* process, not the
# machine — launched from a translated (Rosetta) parent on an Apple Silicon Mac
# it says x86_64, and the arm64 bundle sitting right there would be skipped.
# Trying the binary is the only reliable test of whether it can run here.
if [ -z "$node_bin" ]; then
  for dir in "$JAS_DIR"/server/node/*; do
    if [ -x "$dir/bin/node" ] && "$dir/bin/node" -v > /dev/null 2>&1; then
      node_bin="$dir/bin/node"
      npm_bin="$dir/bin/npm"
      break
    fi
  done
fi

jas_no_node_message() {
  echo "JAS: no Node.js runtime found." >&2
  echo "Install Node.js $REQUIRED_NODE_MAJOR or later (https://nodejs.org), or download a" >&2
  echo "JAS release archive for $jas_platform-$jas_arch, which bundles one." >&2
}

# Prints nothing and returns 0 when node_bin is a new enough Node.
jas_check_node_version() {
  major=$("$node_bin" -p 'process.versions.node.split(".")[0]' 2> /dev/null || echo 0)
  if [ "$major" -lt "$REQUIRED_NODE_MAJOR" ]; then
    echo "JAS: Node.js $REQUIRED_NODE_MAJOR or later is required (found $("$node_bin" -v 2> /dev/null || echo 'unknown'))." >&2
    return 1
  fi
}
