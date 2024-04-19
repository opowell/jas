import express from 'express'
import path from 'path'
import fs from 'fs'
const getApps = (appsPath) => {
  const isFolder = fileName => {
    return !fs.lstatSync(path.join(appsPath, fileName)).isFile()
  }
  return fs.readdirSync(appsPath).filter(isFolder)
}

const processApps = (expressApp, appsPath) => {
  const apps = getApps(appsPath)
  apps.forEach(dir => {
    let appFolder = path.join(appsPath, dir)
    let clientFolder = appFolder
    const clientSubfolder = path.join(clientFolder, 'client')
    if (fs.existsSync(clientSubfolder)) {
      clientFolder = clientSubfolder
    }
    expressApp.use('/' + dir, express.static(clientFolder))
    expressApp.get('/' + dir, (req, res) => {
      res.sendFile(path.join(clientFolder, 'index.html'))
    })
    expressApp.get('/' + dir + '/:id', (req, res) => {
      res.sendFile(path.join(clientFolder, 'index.html'))
    })
  })
}

export {
  processApps,
  getApps
}