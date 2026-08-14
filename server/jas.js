import express from 'express'
import path from 'path'
import { getApps, processApps, createAppsRouter } from './processApps.js'
import { getProjectRoot } from './projectRoot.js'
import { getLocalAddress } from './network.js'
import { createServer } from 'node:http'
import { readFileSync, mkdirSync, createWriteStream } from 'fs'

const serverPath = getProjectRoot()

const logsDir = path.join(serverPath, 'logs')
mkdirSync(logsDir, { recursive: true })
const logTimestamp = new Date().toISOString().replace(/[:.]/g, '-')
const logStream = createWriteStream(path.join(logsDir, `server-${logTimestamp}.log`))
logStream.write(`Server started at ${new Date().toISOString()}\n\n`)

const origLog = console.log.bind(console)
const origError = console.error.bind(console)
console.log = (...args) => { origLog(...args); logStream.write(args.join(' ') + '\n') }
console.error = (...args) => { origError(...args); logStream.write('[ERROR] ' + args.join(' ') + '\n') }

const importedSettingsPath = path.join(serverPath, 'server', 'settings.json')
const importedSettings = JSON.parse(readFileSync(importedSettingsPath, 'utf8'))
const expressApp = express()
const port = importedSettings.port || 3000
const httpServer = createServer(expressApp)

expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: true }))

const defaultAppPath = path.join(serverPath, 'server', 'built-in-apps', importedSettings.defaultApp)
expressApp.use('/', express.static(defaultAppPath))
expressApp.get('/', (req, res) => {
  res.sendFile(path.join(defaultAppPath, 'index.html'))
})

const builtInAppsPath = path.join(serverPath, 'server', 'built-in-apps')
await processApps(expressApp, builtInAppsPath, httpServer)

const appsPath = path.join(serverPath, 'apps')
mkdirSync(appsPath, { recursive: true })
let appsRouter = await createAppsRouter(appsPath, httpServer)
expressApp.use((req, res, next) => appsRouter(req, res, next))

expressApp.get('/apps', (req, res) => {
  res.json(getApps(appsPath))
})

expressApp.get('/refresh', async (req, res) => {
  appsRouter = await createAppsRouter(appsPath, httpServer)
  res.json(getApps(appsPath))
})

const lanAddress = getLocalAddress()
httpServer.listen(port, () => {
  console.log(`Start page: http://localhost:${port}`)
  if (lanAddress) {
    console.log(`On this network: http://${lanAddress}:${port}`)
  }
})
