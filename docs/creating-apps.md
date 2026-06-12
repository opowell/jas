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

## Downloadable example apps

| App | Source |
|-----|--------|
| Tic Tac Toe | `apps/tic-tac-toe-client-server/` (included) |
| Rogue | [github.com/opowell/rogue2](https://github.com/opowell/rogue2) |
