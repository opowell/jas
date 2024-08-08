import express from 'express'
import path from 'path'
import { getApps, processApps } from './processApps.js'
import { getServerPath } from './getServerPath.js'
import { createServer } from 'node:http'
import { readFileSync } from 'fs'
import ip from 'ip'

const serverPath = getServerPath()
const importedSettingsPath = path.join(serverPath, '/server/settings.json')
const importedSettings = JSON.parse(readFileSync(importedSettingsPath, 'utf8'))
const expressApp = express()
let router = undefined
expressApp.use(function (req, res, next) {
  router(req, res, next)
})
const port = importedSettings.port || 3000
const httpServer = createServer(expressApp)

export const setupRouter = () => {
  router = express.Router()
  const defaultAppPath = path.join(serverPath, 'built-in-apps', importedSettings.defaultApp)
  router.use('/', express.static(defaultAppPath))
  router.get('/', (req, res) => {
    res.sendFile(path.join(defaultAppPath, 'index.html'))
  })
  const builtInAppsPath = path.join(serverPath, 'built-in-apps')
  processApps(router, builtInAppsPath)
  const appsPath = path.join(serverPath, 'apps')
  processApps(router, appsPath)
  router.get('/apps', (req, res) => {
    res.json(getApps(appsPath))
  })
  router.get('/refresh', (req, res) => {
    console.log('refresh')
    setupRouter()
    res.text('Apps refreshed.')
  })
}
setupRouter()  
const url = ip.address()
httpServer.listen(port, () => {
  console.log(`JAS - http://${url}:${port}`)
})
