# Server processes

An app can include a `server.js` file to register server-side logic — HTTP endpoints, shared game state, database access, etc.

## Format

`server.js` must export a default function that receives an Express `Router` and an `app` descriptor:

```js
export default (router, app) => {
  // router — Express Router scoped to this app
  // app    — { id: 'your-app-id', route: '/your-app-id' }

  router.get(app.route + '/data', (req, res) => {
    res.json({ hello: 'world' })
  })
}
```

JAS calls this function once at startup for every app that contains a `server.js`.

`app.route` is where the app is served: `/<app-id>`, or the `route` in its `settings.json` (see [Creating apps](./creating-apps.md#route)). Register routes under it rather than under `app.id` so they follow the setting.

The function also receives the server's `http.Server` as a third argument, for things Express routers cannot do, such as accepting WebSocket upgrades. Keep anything attached there under `app.route` too, since every app shares the server.

## Request bodies

`express.json()` and `express.urlencoded()` are applied globally, so `req.body` is populated automatically in POST/PUT handlers — no additional middleware needed.

## State

Module-level variables persist for the lifetime of the server process:

```js
let state = { score: 0 }

export default (router, app) => {
  router.get(app.route + '/state', (req, res) => res.json(state))
  router.post(app.route + '/increment', (req, res) => {
    state.score++
    res.json(state)
  })
}
```

## Hot reload

Calling `GET /refresh` re-scans the `apps/` folder and rebuilds static routes, but does **not** re-run `server.js` files: apps already loaded keep the routes their server modules registered at startup, and only newly added apps have theirs run. To reload server processes you must restart JAS.

## Example

`apps/tic-tac-toe-client-server/` is a working reference. The server owns game state and exposes three endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tic-tac-toe-client-server/state` | Return current board |
| POST | `/tic-tac-toe-client-server/move` | Submit a move |
| POST | `/tic-tac-toe-client-server/reset` | Reset the game |
