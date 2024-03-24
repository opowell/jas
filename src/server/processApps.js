import express from 'express'
import path from 'path'
import fs from 'fs'
const getApps = (appsPath) => {
  const isFile = fileName => {
    return !fs.lstatSync(path.join(appsPath, fileName)).isFile()
  }
  return fs.readdirSync(appsPath).filter(isFile)
}

const processApps = (app, appsPath) => {
  const apps = getApps(appsPath)
  apps.forEach(dir => {
    app.use('/' + dir, express.static(path.join(appsPath, dir)))
    app.get('/' + dir, (req, res) => {
      res.sendFile(path.join(appsPath, dir, 'index.html'))
    })
  })
}

export {
  processApps,
  getApps
}