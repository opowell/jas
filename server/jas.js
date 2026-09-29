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
// PORT overrides server/settings.json, so a second JAS (a project bundling its
// own copy, say) can run beside the usual one without editing tracked settings.
const port = Number(process.env.PORT) || importedSettings.port || 3000
const httpServer = createServer(expressApp)

expressApp.use(express.json())
expressApp.use(express.urlencoded({ extended: true }))

// JAS_DEFAULT_APP names an app in the apps folder to serve at / in place of the
// built-in start page (see the apps router below), so a project bundling JAS
// for one app opens straight on it.
const defaultAppId = process.env.JAS_DEFAULT_APP
if (!defaultAppId) {
  const defaultAppPath = path.join(serverPath, 'server', 'built-in-apps', importedSettings.defaultApp)
  expressApp.use('/', express.static(defaultAppPath))
  expressApp.get('/', (req, res) => {
    res.sendFile(path.join(defaultAppPath, 'index.html'))
  })
}

const builtInAppsPath = path.join(serverPath, 'server', 'built-in-apps')
await processApps(expressApp, builtInAppsPath, httpServer)

// JAS_APPS points the server at an apps folder outside the JAS tree. That is
// how a project that carries JAS as a submodule hosts its own app: it keeps the
// app in its own repo and never writes into the submodule's checkout.
const appsPath = process.env.JAS_APPS
  ? path.resolve(process.env.JAS_APPS)
  : path.join(serverPath, 'apps')
mkdirSync(appsPath, { recursive: true })
let appsRouter = await createAppsRouter(appsPath, httpServer)
// The default app is served at / as well as under its own route: a request is
// first tried as a path inside that app, so the page at / and every relative
// URL it uses (scripts, styles, its API) resolve there. Whatever the app does
// not handle falls through unchanged to the other apps and JAS's own routes.
if (defaultAppId) {
  const appPrefix = '/' + defaultAppId
  expressApp.use((req, res, next) => {
    if (req.path === appPrefix || req.path.startsWith(appPrefix + '/')) return next()
    const url = req.url
    req.url = appPrefix + url
    appsRouter(req, res, () => {
      req.url = url
      next()
    })
  })
}
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
