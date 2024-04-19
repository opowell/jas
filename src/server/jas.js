import express from 'express'
import path from 'path'
import { getApps, processApps } from './processApps.js'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync } from 'fs'
import ip from 'ip'

let serverPath = undefined
if (process.argv[0].indexOf('node') > -1) {
  serverPath         = process.cwd()
} else {
  serverPath         = path.dirname(process.execPath)
}
const importedSettingsPath = path.join(serverPath, '/server/settings.json')
const importedSettings = JSON.parse(readFileSync(importedSettingsPath, 'utf8'))

const expressApp = express()
const port = 3000
const httpServer = createServer(expressApp)
const io = new Server(httpServer)
io.on('connection', (socket) => {
  socket.on('startApp', (id) => {
    io.emit('startAppFromServer', id)
  })
})

function handleRequest(req, res) {
  res.sendFile(path.join(serverPath, 'apps/' + importedSettings.defaultApp + '/index.html'))
}
expressApp.use('/', express.static('apps/' + importedSettings.defaultApp))
console.log(path.join(serverPath, '../static'))
expressApp.use('/static', express.static(path.join(serverPath, '../static')))

const appsPath = path.join(serverPath, 'apps')
processApps(expressApp, appsPath)

expressApp.get('/apps', (req, res) => {
  res.json(getApps(appsPath))
})
expressApp.get('/:id', handleRequest)

const url = ip.address()
const settings = {
  url: ip.address(),
  port
}
const settingsPath = path.join(serverPath, '/server/generated/settings.json')
writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8')

httpServer.listen(port, () => {
  console.log(`JAS - http://${url}:${port}`)
})
