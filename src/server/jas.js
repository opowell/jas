import express from 'express'
import path from 'path'
import { getApps, processApps } from './processApps.js'
import { Server } from 'socket.io'
import { createServer } from 'node:http';

const app = express()
const port = 3000
const httpServer = createServer(app);
const io = new Server(httpServer);
io.on('connection', (socket) => {
  console.log('a user connected');
})

let serverPath = undefined
if (process.argv[0].indexOf('node') > -1) {
  serverPath         = process.cwd()
} else {
  serverPath         = path.dirname(process.execPath)
}

const appsPath = path.join(serverPath, 'apps')
processApps(app, appsPath)

app.get('/apps', (req, res) => {
  res.json(getApps(appsPath))
})

httpServer.listen(port, () => {
  console.log(`JAS - http://127.0.0.1:${port}`)
})
