import express from 'express'
import path from 'path'
import { getApps, processApps, createAppsRouter } from './processApps.js'
import { getServerPath } from './getServerPath.js'
import { createServer } from 'node:http'
import { readFileSync } from 'fs'
import ip from 'ip'

const serverPath = getServerPath()
const importedSettingsPath = path.join(serverPath, '/server/settings.json')
const importedSettings = JSON.parse(readFileSync(importedSettingsPath, 'utf8'))
const expressApp = express()
const port = importedSettings.port || 3000
const httpServer = createServer(expressApp)

expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: true }))

const defaultAppPath = path.join(serverPath, 'server/built-in-apps', importedSettings.defaultApp)
expressApp.use('/', express.static(defaultAppPath))
expressApp.get('/', (req, res) => {
  res.sendFile(path.join(defaultAppPath, 'index.html'))
})

const builtInAppsPath = path.join(serverPath, 'server/built-in-apps')
await processApps(expressApp, builtInAppsPath)

const appsPath = path.join(serverPath, 'apps')
let appsRouter = await createAppsRouter(appsPath)
expressApp.use((req, res, next) => appsRouter(req, res, next))

expressApp.get('/apps', (req, res) => {
  res.json(getApps(appsPath))
})

expressApp.get('/refresh', async (req, res) => {
  appsRouter = await createAppsRouter(appsPath)
  res.json(getApps(appsPath))
})

const url = ip.address()
httpServer.listen(port, () => {
  console.log(`Start page: http://${url}:${port}`)
})
