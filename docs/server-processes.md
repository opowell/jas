# Server processes

An app can include a `server.js` file to register server-side logic — HTTP endpoints, shared game state, database access, etc.

## Format

`server.js` must export a default function that receives an Express `Router` and an `app` descriptor:

```js
export default (router, app) => {
  // router — Express Router scoped to this app
  // app    — { id: 'your-app-id' }

  router.get('/' + app.id + '/data', (req, res) => {
    res.json({ hello: 'world' })
  })
}
```

JAS calls this function once at startup for every app that contains a `server.js`.

## Request bodies

`express.json()` and `express.urlencoded()` are applied globally, so `req.body` is populated automatically in POST/PUT handlers — no additional middleware needed.

## State

Module-level variables persist for the lifetime of the server process:

```js
let state = { score: 0 }

export default (router, app) => {
  router.get('/' + app.id + '/state', (req, res) => res.json(state))
  router.post('/' + app.id + '/increment', (req, res) => {
    state.score++
    res.json(state)
  })
}
```

## Hot reload

Calling `GET /refresh` re-scans the `apps/` folder and rebuilds static routes, but does **not** re-run `server.js` files. To reload server processes you must restart JAS.

## Example

`apps/tic-tac-toe-client-server/` is a working reference. The server owns game state and exposes three endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/tic-tac-toe-client-server/state` | Return current board |
| POST | `/tic-tac-toe-client-server/move` | Submit a move |
| POST | `/tic-tac-toe-client-server/reset` | Reset the game |
