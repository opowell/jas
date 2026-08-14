# Installation

JAS runs on macOS, Linux and Windows. It needs a Node.js runtime — either one
already installed on the machine, or one bundled inside a release archive.

## Option 1 — download a release (no Node.js needed)

Grab the archive for your platform from the
[releases page](https://github.com/opowell/jas/releases) and unpack it:

| Archive | For |
| --- | --- |
| `jas-<version>-darwin-arm64.tar.gz` | macOS, Apple Silicon |
| `jas-<version>-darwin-x64.tar.gz` | macOS, Intel |
| `jas-<version>-linux-x64.tar.gz` | Linux, x86-64 |
| `jas-<version>-linux-arm64.tar.gz` | Linux, ARM64 (e.g. 64-bit Raspberry Pi) |
| `jas-<version>-win-x64.zip` | Windows, x86-64 |
| `jas-<version>-portable.zip` | any platform, uses the Node.js already on the machine |

These archives contain everything needed to run: a Node.js runtime under
`server/node/`, and the dependencies under `node_modules/`. Nothing to install.

## Option 2 — clone or download the repository

Requires [Node.js](https://nodejs.org) 20 or later on the machine.

```sh
git clone https://github.com/opowell/jas.git
cd jas
```

Dependencies are committed, so this is enough to run. If you would rather
install them yourself — or `node_modules/` is missing or out of date:

```sh
npm install
```

`jas.sh` and `jas.cmd` also run `npm install` on their own if `node_modules/` is
absent.

## Run

macOS and Linux:

```sh
./jas.sh
```

Windows:

```
jas.cmd
```

(or double-click `jas.cmd` in Explorer)

The server prints its URLs on startup:

```
Start page: http://localhost:4500
On this network: http://192.168.1.20:4500
```

Open either in a browser to reach the Launchpad. Use the second one from phones
and other machines on the same network.

The port comes from `"port"` in [server/settings.json](../server/settings.json).

### Which Node.js gets used

The launchers pick the first of:

1. a runtime bundled under `server/node/<version>-<platform>-<arch>` (how the
   platform release archives ship Node)
2. `$JAS_NODE` / `%JAS_NODE%`, if set — point it at a `node` executable to
   override everything else
3. `node` on `PATH`

If none of those exist, or the version found is older than 20, the launcher says
so and stops.

## Auto-start on login

### macOS

```sh
./install.sh
```

Generates `server/localhost.jas.plist` from the template with this project's
path, copies it to `~/Library/LaunchAgents/`, and loads it.

Check it: `launchctl list | grep jas`

**Requirement:** the project folder must not be in a macOS-restricted location
(Documents, Desktop, Downloads).

### Linux

```sh
./install.sh
```

Generates a systemd **user** service at `~/.config/systemd/user/jas.service`,
enables and starts it, and enables lingering so JAS keeps running when you are
not logged in.

Check it: `systemctl --user status jas`
Follow its output: `journalctl --user -u jas -f`

### Windows

```
install.cmd
```

Registers a Scheduled Task named `JAS` that runs `jas.cmd` at logon.

Check it: `schtasks /query /tn JAS`
Start it now, without logging out: `schtasks /run /tn JAS`

## Uninstall auto-start

```sh
./uninstall.sh     # macOS, Linux
```

```
uninstall.cmd      REM Windows
```

This removes the launchd agent / systemd unit / scheduled task. Project files
are left untouched.

## Environment variables

| Variable | Effect |
| --- | --- |
| `JAS_NODE` | Path to the `node` executable to run the server with. |
| `JAS_HOME` | Project root to serve from (`apps/`, `logs/`, `server/settings.json`). Defaults to the folder holding `jas.sh`. |
