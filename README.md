# JAS — Javascript App Server

A lightweight local server that hosts web apps. Open a browser and use the
Launchpad to launch any app in your `apps/` folder.

Runs on macOS, Linux and Windows.

## Quick start

**1. Get JAS.** Clone or download this repository — that needs
[Node.js](https://nodejs.org) 22 or later on the machine. Without Node.js,
download the archive for your platform from the
[releases page](https://github.com/opowell/jas/releases) and unpack it: it
bundles its own Node runtime.

**2. Run it.** Dependencies are committed, so there is nothing to install
first.

```sh
./jas.sh        # macOS, Linux
```

```
jas.cmd         REM Windows
```

**3. Open the URL it prints.**

```
Start page: http://localhost:4500
On this network: http://192.168.1.20:4500
```

That is the Launchpad. Use the second URL from phones and other machines on the
same network.

## Documentation

- [Installation](docs/installation.md) — the ways to install and run, auto-start on login, uninstall
- [Creating apps](docs/creating-apps.md) — folder structure, preview images, hot reload
- [Server processes](docs/server-processes.md) — adding Express routes and server-side state via `server.js`
- [Development](docs/dev-notes.md) — repo layout, releasing, working on JAS itself
