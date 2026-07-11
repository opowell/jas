import express from 'express'
import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'

// Every top-level folder under appsPath, app or not (shared-library
// folders included).
const listFolders = (appsPath) => {
  const isFolder = fileName => {
    return !fs.lstatSync(path.join(appsPath, fileName)).isFile()
  }
  return fs.readdirSync(appsPath).filter(isFolder)
}

const getApps = (appsPath) => {
  const isApp = fileName => fs.existsSync(path.join(appsPath, fileName, 'index.html'))
  const appFolders = listFolders(appsPath).filter(isApp)
  return appFolders.map(f => {
    const out = {
      id: f
    }
    if (fs.existsSync(path.join(appsPath, f, 'preview.png'))) {
      out.previewImage = 'preview.png'
    }
    return out
  })
}

const DEFAULT_CLIENTS = './index.html'
const DEFAULT_SERVERS = './server.js'

// Normalizes a "clients"/"servers" settings value (undefined, string, or
// array of strings) into an array of strings, falling back to defaultValue.
const normalizePaths = (value, defaultValue) => {
  if (value === undefined) return [defaultValue]
  if (Array.isArray(value)) return value
  return [value]
}

const getAppSettings = (appFolder) => {
  const settingsFile = path.join(appFolder, 'settings.json')
  let settings = {}
  if (fs.existsSync(settingsFile)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'))
    } catch (err) {
      console.error('failed to read settings.json for ' + appFolder + ':', err)
    }
  }
  return {
    clients: normalizePaths(settings.clients, DEFAULT_CLIENTS),
    servers: normalizePaths(settings.servers, DEFAULT_SERVERS),
    sharedApps: Array.isArray(settings.sharedApps) ? settings.sharedApps : []
  }
}

// Turns a client file path (e.g. "./admin.html") into the URL segment it's
// served at under the app's route (e.g. "/admin"). "./index.html" maps to
// the app's root route.
const clientRoute = (clientPath) => {
  const name = path.basename(clientPath, path.extname(clientPath))
  return name === 'index' ? '' : '/' + name
}

// Recursively finds every index.html under dirAbs, returning each one's
// directory relative to dirAbs ('' for dirAbs itself, 'app1' for a subfolder).
const findIndexHtmlDirs = (dirAbs, baseDirAbs = dirAbs) => {
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true })
  let results = entries.some(e => e.isFile() && e.name === 'index.html')
    ? [path.relative(baseDirAbs, dirAbs)]
    : []
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results = results.concat(findIndexHtmlDirs(path.join(dirAbs, entry.name), baseDirAbs))
    }
  }
  return results
}

// A clients entry that points at a folder is expanded into one route per
// index.html found anywhere inside it, mirroring the folder structure, e.g.
// "./" with ./index.html and ./app1/index.html yields "/app" and "/app/app1".
const registerFolderClient = (router, app, appFolder, clientPath) => {
  const folder = path.join(appFolder, clientPath)
  const prefix = clientPath.replace(/^\.\//, '').replace(/\/+$/, '')
  const routePrefix = prefix ? '/' + prefix.split(path.sep).join('/') : ''
  for (const relDir of findIndexHtmlDirs(folder)) {
    const routeSuffix = relDir ? '/' + relDir.split(path.sep).join('/') : ''
    const route = '/' + app.id + routePrefix + routeSuffix
    const file = path.join(folder, relDir, 'index.html')
    router.get(route, (req, res) => {
      res.sendFile(file)
    })
  }
}

const registerClients = (router, app, appFolder, clients) => {
  for (const clientPath of clients) {
    const resolved = path.join(appFolder, clientPath)
    if (fs.existsSync(resolved) && fs.statSync(resolved).isDirectory()) {
      registerFolderClient(router, app, appFolder, clientPath)
    } else {
      const route = '/' + app.id + clientRoute(clientPath)
      router.get(route, (req, res) => {
        res.sendFile(resolved)
      })
    }
  }
}

const loadServerProcesses = async (router, app, appFolder, servers) => {
  for (const serverPath of servers) {
    const serverFile = path.join(appFolder, serverPath)
    if (!fs.existsSync(serverFile)) continue
    try {
      const mod = await import(pathToFileURL(serverFile).href)
      if (typeof mod.default === 'function') {
        mod.default(router, app)
        console.log('loaded server process: ' + app.id + ' (' + serverPath + ')')
      }
    } catch (err) {
      console.error('failed to load server process for ' + app.id + ' (' + serverPath + '):', err)
    }
  }
}

// Mounts an app's own static files, then any folders it names in
// settings.json's "sharedApps" as fallbacks, in order, for files the app
// doesn't have its own copy of. express.static calls next() on a missing
// file, so the app's own files always take priority over shared ones.
const registerStatic = (router, app, appFolder, appsPath, sharedApps) => {
  router.use('/' + app.id, express.static(appFolder, { index: false }))
  for (const sharedAppId of sharedApps) {
    router.use('/' + app.id, express.static(path.join(appsPath, sharedAppId), { index: false }))
  }
}

// Folders under appsPath that aren't full apps (no index.html) — plain
// library folders like apps/vue-global. Served at their own path too, so
// they're fetchable directly at e.g. /vue-global/vue.global.js in
// addition to being referenced via "sharedApps".
const registerLibraryFolderStatics = (router, appsPath, appIds) => {
  for (const folder of listFolders(appsPath)) {
    if (appIds.has(folder)) continue
    router.use('/' + folder, express.static(path.join(appsPath, folder), { index: false }))
  }
}

const processApps = async (expressApp, appsPath) => {
  console.log('loading apps: ' + appsPath)
  const apps = getApps(appsPath)
  registerLibraryFolderStatics(expressApp, appsPath, new Set(apps.map(a => a.id)))
  for (const app of apps) {
    const appFolder = path.join(appsPath, app.id)
    const { clients, servers, sharedApps } = getAppSettings(appFolder)
    registerStatic(expressApp, app, appFolder, appsPath, sharedApps)
    registerClients(expressApp, app, appFolder, clients)
    await loadServerProcesses(expressApp, app, appFolder, servers)
    console.log('loaded app: ' + app.id, appFolder)
  }
}

const createAppsRouter = async (appsPath) => {
  const router = express.Router()
  console.log('loading apps: ' + appsPath)
  const apps = getApps(appsPath)
  registerLibraryFolderStatics(router, appsPath, new Set(apps.map(a => a.id)))
  for (const app of apps) {
    const appFolder = path.join(appsPath, app.id)
    const { clients, servers, sharedApps } = getAppSettings(appFolder)
    registerStatic(router, app, appFolder, appsPath, sharedApps)
    registerClients(router, app, appFolder, clients)
    await loadServerProcesses(router, app, appFolder, servers)
    console.log('loaded app: ' + app.id, appFolder)
  }
  return router
}

export {
  processApps,
  createAppsRouter,
  getApps
}