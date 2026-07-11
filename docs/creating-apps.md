# Creating apps

## Basics

Create a sub-folder inside the top-level `apps/` directory. The folder name becomes the app's URL path and its display name in the Launchpad.

```
apps/
  my-app/
    index.html     ← required
    preview.png    ← optional, shown as the Launchpad icon
    ...            ← any other static assets
```

Once the server is running, your app is available at:

```
http://<host>:<port>/my-app
```

## Preview image

Place a `preview.png` in the app folder to display a thumbnail in the Launchpad instead of the generated letter icon.

## Hot reload

Static assets are served from disk on every request — no restart needed after editing HTML, CSS, or JS.

To pick up a newly added app folder without restarting the server, call the refresh endpoint:

```
GET /refresh
```

This re-scans the `apps/` directory and returns the updated app list as JSON. Existing server processes are **not** re-initialized on refresh (see [Server processes](./server-processes.md)).

## Server-side logic

Apps can include a `server.js` file to register Express routes that run in the server process. See [Server processes](./server-processes.md).

## Multiple client/server files

By default an app serves `./index.html` as its client and loads `./server.js` as its server process. To use different files, or more than one of each, add a `settings.json` to the app folder:

```json
{
  "clients": "./index.html",
  "servers": ["./server.js", "./admin-server.js"]
}
```

- `clients` / `servers` may be omitted, a single string, or an array of strings.
- Each client file is served at `/<app-id>` (for `index.html`) or `/<app-id>/<name>` for any other file — e.g. `./admin.html` → `/my-app/admin`.
- If a `clients` entry points at a folder instead of a file, it's searched recursively for `index.html` files, each served at a route mirroring its location. For example, with `"clients": "./"` and files `./index.html` and `./app1/index.html`, `/my-app` serves the first and `/my-app/app1` serves the second.
- Each server file is loaded the same way a single `server.js` is (see [Server processes](./server-processes.md)).

See `apps/multi-view-counter/` for a working example.

## Shared libraries

A library used by multiple apps gets its own folder under `apps/`, one file per folder — e.g. `apps/vue-global/vue.global.js`, `apps/vue3-sfc-loader/vue3-sfc-loader.js`, `apps/web437-ibm-vga-8x14/Web437_IBM_VGA_8x14.woff`. These folders aren't apps themselves — they have no `index.html`, so they're excluded from the Launchpad and the `/apps` list — but each is still served at its own path (e.g. `/vue-global/vue.global.js`).

An app references the specific library folders it needs in `settings.json`:

```json
{
  "sharedApps": ["vue-global", "vue3-sfc-loader"]
}
```

Each named folder is mounted as a fallback under the app's own path, in order, for any file the app doesn't have a local copy of — so `<script src="vue.global.js">` in the app's `index.html` resolves to `apps/vue-global/vue.global.js` with no changes needed. If the app has its own copy of a file, that copy is always served instead of the shared one.

## Downloadable example apps

| App | Source |
|-----|--------|
| Tic Tac Toe | `apps/tic-tac-toe-client-server/` (included) |
| Multi-view counter (`settings.json`) | `apps/multi-view-counter/` (included) |
| Rogue | [github.com/opowell/rogue2](https://github.com/opowell/rogue2) |
