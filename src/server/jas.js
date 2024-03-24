import express from 'express'
import path from 'path'
import { getApps, processApps } from './processApps.js'

const app = express()
const port = 3000

let serverPath = undefined
console.log(process.argv, process.cwd(), process.execPath)
if (process.argv[0].indexOf('node') > -1) {
  serverPath         = process.cwd()
} else {
  serverPath         = path.dirname(process.execPath)
}

const appsPath = path.join(serverPath, 'apps')
processApps(app, appsPath)

app.get('/apps', (req, res) => {
  res.json(getApps(appsPath))
})

app.listen(port, () => {
  console.log(`JAS - http://127.0.0.1:${port}`)
})
