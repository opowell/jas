import express from 'express'
import path from 'path'
import fs from 'fs'
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

const processApps = (expressApp, appsPath) => {
  console.log('loading apps: ' + appsPath)
  const apps = getApps(appsPath)
  apps.forEach(app => {
    const appFolder = path.join(appsPath, app.id)
    expressApp.use('/' + app.id, express.static(appFolder))
    expressApp.get('/' + app.id, (req, res) => {
      res.sendFile(path.join(appFolder, 'index.html'))
    })
    console.log('loaded app: ' + app.id, appFolder)
  })
}

export {
  processApps,
  getApps
}