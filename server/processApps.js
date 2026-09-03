import express from 'express'
import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'
import { getProjectRoot } from './projectRoot.js'

// Libraries that ship with JAS (e.g. built-in-apps/vue-global) live here, so
// they are available to every app without being copied into each apps/ folder.
const BUILT_IN_APPS_PATH = path.join(getProjectRoot(), 'server', 'built-in-apps')

// Every top-level folder under appsPath, app or not (shared-library
// folders included).
const listFolders = (appsPath) => {
  const isFolder = fileName => {
    return !fs.lstatSync(path.join(appsPath, fileName)).isFile()
  }
  return fs.readdirSync(appsPath).filter(isFolder)
}

// A folder is an app if it has its own root index.html, or if its
// settings.json explicitly declares client pages elsewhere (e.g. nested
// under an "apps" subfolder).
const isApp = (appsPath, fileName) => {
  const appFolder = path.join(appsPath, fileName)
  if (fs.existsSync(path.join(appFolder, 'index.html'))) return true
  const settingsFile = path.join(appFolder, 'settings.json')
  if (!fs.existsSync(settingsFile)) return false
  try {
    const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'))
    return settings.clients !== undefined
  } catch {
    return false
  }
}

const getApps = (appsPath) => {
  const appFolders = listFolders(appsPath).filter(f => isApp(appsPath, f))
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
    // Set to false when a server module (see loadServerProcesses) fully owns its
    // own static/file serving and the app's raw source tree should not also be
    // exposed wholesale as static files (e.g. it contains non-public data dirs).
    serveStatic: settings.static !== false,
    sharedApps: Array.isArray(settings.sharedApps) ? settings.sharedApps : []
  }
}

// Turns a client file path (e.g. "./admin.html") into the URL segment it's
// served at under the app's route (e.g. "/admin"). "./index.html" maps to
// the app's root route. A nested "./index.html" (e.g. "./apps/design/index.html")
// uses its parent folder's name instead, so sibling index.html files don't collide.
const clientRoute = (clientPath) => {
  const name = path.basename(clientPath, path.extname(clientPath))
  if (name !== 'index') return '/' + name
  const dirName = path.basename(path.dirname(clientPath))
  return dirName === '.' ? '' : '/' + dirName
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

// httpServer is passed through so an app's server module can register its own
// WebSocket 'upgrade' handling (scoped to its own route prefix) on the shared
// server, since Express routers have no concept of upgrade requests.
const loadServerProcesses = async (router, app, appFolder, servers, httpServer) => {
  for (const serverPath of servers) {
    const serverFile = path.join(appFolder, serverPath)
    if (!fs.existsSync(serverFile)) continue
    try {
      const mod = await import(pathToFileURL(serverFile).href)
      if (typeof mod.default === 'function') {
        mod.default(router, app, httpServer)
        console.log('loaded server process: ' + app.id + ' (' + serverPath + ')')
      }
    } catch (err) {
      console.error('failed to load server process for ' + app.id + ' (' + serverPath + '):', err)
    }
  }
}

// A "sharedApps" entry names a folder alongside the app, falling back to the
// libraries that ship with JAS, so an app in apps/ can use e.g. "vue-global"
// without keeping its own copy of it. Returns null if neither root has it.
const resolveSharedApp = (appsPath, sharedAppId) => {
  for (const root of [appsPath, BUILT_IN_APPS_PATH]) {
    const folder = path.join(root, sharedAppId)
    if (fs.existsSync(folder)) return folder
  }
  return null
}

// Mounts an app's own static files, then any folders it names in
// settings.json's "sharedApps" as fallbacks, in order, for files the app
// doesn't have its own copy of. express.static calls next() on a missing
// file, so the app's own files always take priority over shared ones.
const registerStatic = (router, app, appFolder, appsPath, sharedApps) => {
  router.use('/' + app.id, express.static(appFolder, { index: false }))
  for (const sharedAppId of sharedApps) {
    const folder = resolveSharedApp(appsPath, sharedAppId)
    if (folder === null) {
      console.error('sharedApps entry not found for ' + app.id + ': ' + sharedAppId)
      continue
    }
    router.use('/' + app.id, express.static(folder, { index: false }))
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

const processApps = async (expressApp, appsPath, httpServer) => {
  console.log('loading apps: ' + appsPath)
  const apps = getApps(appsPath)
  registerLibraryFolderStatics(expressApp, appsPath, new Set(apps.map(a => a.id)))
  for (const app of apps) {
    const appFolder = path.join(appsPath, app.id)
    const { clients, servers, sharedApps, serveStatic } = getAppSettings(appFolder)
    if (serveStatic) registerStatic(expressApp, app, appFolder, appsPath, sharedApps)
    registerClients(expressApp, app, appFolder, clients)
    await loadServerProcesses(expressApp, app, appFolder, servers, httpServer)
    console.log('loaded app: ' + app.id, appFolder)
  }
}

const createAppsRouter = async (appsPath, httpServer) => {
  const router = express.Router()
  console.log('loading apps: ' + appsPath)
  const apps = getApps(appsPath)
  registerLibraryFolderStatics(router, appsPath, new Set(apps.map(a => a.id)))
  for (const app of apps) {
    const appFolder = path.join(appsPath, app.id)
    const { clients, servers, sharedApps, serveStatic } = getAppSettings(appFolder)
    if (serveStatic) registerStatic(router, app, appFolder, appsPath, sharedApps)
    registerClients(router, app, appFolder, clients)
    await loadServerProcesses(router, app, appFolder, servers, httpServer)
    console.log('loaded app: ' + app.id, appFolder)
  }
  return router
}

export {
  processApps,
  createAppsRouter,
  getApps
}