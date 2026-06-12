import express from 'express'
import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'url'

const getApps = (appsPath) => {
  const isFolder = fileName => {
    return !fs.lstatSync(path.join(appsPath, fileName)).isFile()
  }
  const appFolders = fs.readdirSync(appsPath).filter(isFolder)
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

const loadServerProcess = async (router, app, appFolder) => {
  const serverFile = path.join(appFolder, 'server.js')
  if (!fs.existsSync(serverFile)) return
  try {
    const mod = await import(pathToFileURL(serverFile).href)
    if (typeof mod.default === 'function') {
      mod.default(router, app)
      console.log('loaded server process: ' + app.id)
    }
  } catch (err) {
    console.error('failed to load server process for ' + app.id + ':', err)
  }
}

const processApps = async (expressApp, appsPath) => {
  console.log('loading apps: ' + appsPath)
  for (const app of getApps(appsPath)) {
    const appFolder = path.join(appsPath, app.id)
    expressApp.use('/' + app.id, express.static(appFolder))
    expressApp.get('/' + app.id, (req, res) => {
      res.sendFile(path.join(appFolder, 'index.html'))
    })
    await loadServerProcess(expressApp, app, appFolder)
    console.log('loaded app: ' + app.id, appFolder)
  }
}

const createAppsRouter = async (appsPath) => {
  const router = express.Router()
  console.log('loading apps: ' + appsPath)
  for (const app of getApps(appsPath)) {
    const appFolder = path.join(appsPath, app.id)
    router.use('/' + app.id, express.static(appFolder))
    router.get('/' + app.id, (req, res) => {
      res.sendFile(path.join(appFolder, 'index.html'))
    })
    await loadServerProcess(router, app, appFolder)
    console.log('loaded app: ' + app.id, appFolder)
  }
  return router
}

export {
  processApps,
  createAppsRouter,
  getApps
}