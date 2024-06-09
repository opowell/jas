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
const port = importedSettings.port || 3000
const httpServer = createServer(expressApp)

expressApp.use('/', express.static('apps/' + importedSettings.defaultApp))

const builtInAppsPath = path.join(serverPath, 'built-in-apps')
processApps(expressApp, builtInAppsPath)
const appsPath = path.join(serverPath, 'apps')
processApps(expressApp, appsPath)

expressApp.get('/apps', (req, res) => {
  res.json(getApps(appsPath))
})

const url = ip.address()
httpServer.listen(port, () => {
  console.log(`JAS - http://${url}:${port}`)
})
