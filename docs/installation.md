# Installation

## Prerequisites

- macOS (the bundled Node binary targets `darwin-x64`)
- The project must not be located inside a macOS-restricted folder (Documents, Desktop, Downloads, etc.)

## Clone or download

```sh
git clone https://github.com/opowell/jas-repo.git
cd jas-repo
```

Or download and unzip the release archive, then open a terminal in the project root.

## Run manually

Make `jas.sh` executable (only needed once):

```sh
chmod +x jas.sh
```

Start the server:

```sh
./jas.sh
```

The server prints the local URL on startup, e.g. `http://192.168.1.x:3000`. Open that in a browser to reach the Launchpad.

The default port is `3000`. Change it by setting `"port"` in [server/settings.json](../server/settings.json).

## Auto-start on login (macOS)

`install.sh` registers a launchd agent so JAS starts automatically when you log in.

```sh
./install.sh
```

What it does:
1. Creates `server/logs/` if it does not exist.
2. Generates `server/localhost.jas.plist` from the template, substituting the current project path.
3. Copies the plist to `~/Library/LaunchAgents/`.
4. Unloads any existing registration, then loads the new one.

**Requirement:** the project folder must not be in a macOS-restricted location (Documents, Desktop, etc.).

## Uninstall auto-start

```sh
./uninstall.sh
```

This unloads the launchd agent and removes the plist from `~/Library/LaunchAgents/`. The project files are left untouched.

To verify the process is no longer running:

```sh
launchctl list | grep jas
```
