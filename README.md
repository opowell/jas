# JAS — Javascript App Server

A lightweight local server that hosts web apps. Open a browser and use the Launchpad to launch any app in your `apps/` folder.

Runs on macOS, Linux and Windows.

## Quick start

**With [Node.js](https://nodejs.org) 20+ installed** — clone or download this repository, then:

```sh
./jas.sh        # macOS, Linux
```

```
jas.cmd         REM Windows
```

Dependencies are committed, so there is nothing to install first. (`npm install` also works, and the launchers run it themselves if `node_modules/` is missing.)

**Without Node.js** — download the archive for your platform from the [releases page](https://github.com/opowell/jas/releases) and unpack it. It bundles its own Node runtime; the same commands above start it.

Then open the URL printed in the terminal (e.g. `http://localhost:4500`).

## Documentation

- [Installation](docs/installation.md) — the ways to install and run, auto-start on login, uninstall
- [Creating apps](docs/creating-apps.md) — folder structure, preview images, hot reload
- [Server processes](docs/server-processes.md) — adding Express routes and server-side state via `server.js`
- [Releases](docs/releases.md) — how the platform archives are built and published
