// Builds the JAS release archives into dist/.
//
//   node scripts/build-release.mjs [--node-version vX.Y.Z] [--targets a,b,c] [--out dist] [--ref HEAD]
//
// Produces one "portable" archive with no Node bundled (for machines that
// already have Node installed), plus one archive per platform target with a
// Node runtime unpacked into server/node/<version>-<target>, which jas.sh and
// jas.cmd pick up automatically.

import { execFileSync } from 'child_process'
import { createHash } from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const ALL_TARGETS = ['darwin-arm64', 'darwin-x64', 'linux-x64', 'linux-arm64', 'win-x64']
const NODE_DIST = 'https://nodejs.org/dist'

const parseArgs = (argv) => {
  const args = { targets: ALL_TARGETS, out: 'dist', nodeVersion: undefined, ref: 'HEAD' }
  for (let i = 0; i < argv.length; i++) {
    const [flag, inlineValue] = argv[i].split(/=(.*)/s)
    const value = inlineValue !== undefined ? inlineValue : argv[++i]
    if (flag === '--node-version') args.nodeVersion = value
    else if (flag === '--targets') args.targets = value.split(',').map(t => t.trim()).filter(Boolean)
    else if (flag === '--out') args.out = value
    else if (flag === '--ref') args.ref = value
    else throw new Error('unknown argument: ' + argv[i])
  }
  const unknown = args.targets.filter(t => !ALL_TARGETS.includes(t))
  if (unknown.length) throw new Error('unknown target(s): ' + unknown.join(', ') + '. Known: ' + ALL_TARGETS.join(', '))
  return args
}

const run = (command, commandArgs, options = {}) => {
  return execFileSync(command, commandArgs, { stdio: 'inherit', ...options })
}

const has = (command) => {
  try {
    execFileSync(process.platform === 'win32' ? 'where' : 'which', [command], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

// The most recent LTS release, so a plain `npm run build-release` doesn't need
// a version pinned in this file that then goes stale.
const latestLtsVersion = async () => {
  const response = await fetch(NODE_DIST + '/index.json')
  if (!response.ok) throw new Error('could not list Node releases: HTTP ' + response.status)
  const releases = await response.json()
  const lts = releases.find(release => release.lts)
  if (!lts) throw new Error('no LTS release found in the Node release index')
  return lts.version
}

const download = async (url, destination) => {
  const response = await fetch(url)
  if (!response.ok) throw new Error('download failed (HTTP ' + response.status + '): ' + url)
  fs.writeFileSync(destination, Buffer.from(await response.arrayBuffer()))
}

const sha256 = (file) => createHash('sha256').update(fs.readFileSync(file)).digest('hex')

// Node publishes one SHASUMS256.txt per release; verifying against it catches a
// truncated or tampered-with download before we ship it to anyone.
const verifyChecksum = async (nodeVersion, fileName, file) => {
  const response = await fetch(`${NODE_DIST}/${nodeVersion}/SHASUMS256.txt`)
  if (!response.ok) throw new Error('could not fetch SHASUMS256.txt: HTTP ' + response.status)
  const line = (await response.text()).split('\n').find(l => l.trim().endsWith(' ' + fileName))
  if (!line) throw new Error('no checksum published for ' + fileName)
  const expected = line.trim().split(/\s+/)[0]
  const actual = sha256(file)
  if (actual !== expected) throw new Error(`checksum mismatch for ${fileName}\n  expected ${expected}\n  actual   ${actual}`)
}

const extract = (archive, intoDir) => {
  fs.mkdirSync(intoDir, { recursive: true })
  if (archive.endsWith('.zip')) {
    // The zip holds a single node-vX-win-x64/ root, which we flatten into intoDir.
    const staging = intoDir + '-zip'
    fs.rmSync(staging, { recursive: true, force: true })
    fs.mkdirSync(staging, { recursive: true })
    if (has('unzip')) run('unzip', ['-q', archive, '-d', staging])
    else run('tar', ['-xf', archive, '-C', staging]) // bsdtar (macOS, Windows) reads zips
    const [root] = fs.readdirSync(staging)
    fs.rmSync(intoDir, { recursive: true, force: true })
    fs.renameSync(path.join(staging, root), intoDir)
    fs.rmSync(staging, { recursive: true, force: true })
  } else {
    run('tar', ['-xzf', archive, '-C', intoDir, '--strip-components=1'])
  }
}

// The release contents are exactly what is committed, so an archive and a
// `git clone` of the same tag behave identically.
const stageProject = (stageDir, ref) => {
  fs.rmSync(stageDir, { recursive: true, force: true })
  fs.mkdirSync(stageDir, { recursive: true })
  const tarball = stageDir + '.tar'
  run('git', ['archive', '--format=tar', '-o', tarball, ref], { cwd: projectRoot })
  run('tar', ['-xf', tarball, '-C', stageDir])
  fs.rmSync(tarball, { force: true })
  // Dependencies come from the lockfile rather than the committed node_modules,
  // so a release can never ship a stale tree.
  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['ci', '--omit=dev', '--no-audit', '--no-fund'], { cwd: stageDir })
}

const archive = (parentDir, folderName, outputFile) => {
  fs.rmSync(outputFile, { force: true })
  if (outputFile.endsWith('.zip')) {
    if (!has('zip')) throw new Error('`zip` is required to build .zip archives')
    run('zip', ['-qry', outputFile, folderName], { cwd: parentDir })
  } else {
    run('tar', ['-czf', outputFile, folderName], { cwd: parentDir })
  }
  console.log('  built ' + path.relative(projectRoot, outputFile))
}

const main = async () => {
  const args = parseArgs(process.argv.slice(2))
  const { version } = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
  const nodeVersion = args.nodeVersion || await latestLtsVersion()

  const outDir = path.resolve(projectRoot, args.out)
  const workDir = path.join(outDir, 'work')
  const cacheDir = path.join(outDir, 'node-cache')
  fs.mkdirSync(cacheDir, { recursive: true })

  const folderName = 'jas-' + version
  const stageDir = path.join(workDir, folderName)

  console.log(`building JAS ${version} release archives (bundled Node ${nodeVersion})`)
  stageProject(stageDir, args.ref)

  console.log('portable (no bundled Node):')
  archive(workDir, folderName, path.join(outDir, `${folderName}-portable.zip`))

  for (const target of args.targets) {
    console.log(target + ':')
    const isWindows = target.startsWith('win-')
    const fileName = `node-${nodeVersion}-${target}.` + (isWindows ? 'zip' : 'tar.gz')
    const cached = path.join(cacheDir, fileName)

    if (!fs.existsSync(cached)) {
      console.log('  downloading ' + fileName)
      await download(`${NODE_DIST}/${nodeVersion}/${fileName}`, cached)
    }
    await verifyChecksum(nodeVersion, fileName, cached)

    const targetDir = path.join(workDir, target)
    fs.rmSync(targetDir, { recursive: true, force: true })
    fs.mkdirSync(targetDir, { recursive: true })
    fs.cpSync(stageDir, path.join(targetDir, folderName), { recursive: true })

    extract(cached, path.join(targetDir, folderName, 'server', 'node', `${nodeVersion}-${target}`))
    archive(targetDir, folderName, path.join(outDir, `${folderName}-${target}.` + (isWindows ? 'zip' : 'tar.gz')))
  }

  fs.rmSync(workDir, { recursive: true, force: true })
  console.log('\ndone. Archives are in ' + path.relative(projectRoot, outDir) + '/')
}

main().catch(error => {
  console.error('build-release: ' + error.message)
  process.exit(1)
})
