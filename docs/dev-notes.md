# Development notes

Notes for working on JAS itself. For using it, start at the
[README](../README.md) and [Installation](installation.md).

## Repo layout

| Path | What it is |
| --- | --- |
| `jas.sh`, `jas.cmd` | the launchers — find a Node runtime, then start the server |
| `server/` | the server itself, its settings, and the built-in Launchpad app |
| `scripts/` | `install.sh` / `install.cmd` and their uninstallers, which register JAS to start on login, plus the development-only scripts for cutting a release and building archives |
| `docs/` | this documentation |
| `apps/` | your apps — created on first run, never committed |
| `logs/` | one log file per server start, never committed |

Only the launchers, the README and the two git config files sit at the root.
`package.json`, `package-lock.json` and `node_modules/` also stay there because
npm and Node's module resolution require it.

## Committed dependencies

`node_modules/` and `package-lock.json` are both committed on purpose:

- a clone or a downloaded zip runs with no `npm install` step, which is the
  whole point of the quick start;
- the release build reinstalls `node_modules/` from `package-lock.json` with
  `npm ci --omit=dev`, so the lockfile has to be in the tree at every tagged
  ref or an archive cannot be built from it.

The launchers still run `npm install` themselves if `node_modules/` is missing,
so an incomplete copy of the project recovers on its own.

## Releasing

[Releases](releases.md) covers cutting a release, building the platform
archives locally, and what ends up inside one.

## Local helpers

```sh
./scripts/kill-3000.sh    # free port 3000 if something is stuck on it
```

Only the installers ship in the release archives. `release.sh`,
`build-release.mjs` and `kill-3000.sh` are marked `export-ignore` in
[.gitattributes](../.gitattributes), so they are stripped out along with the CI
and editor config.

The server's own port comes from `"port"` in
[server/settings.json](../server/settings.json) and defaults to 4500.
