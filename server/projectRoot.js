import path from 'path'
import { fileURLToPath } from 'url'

// The project root — the folder holding `server/`, `apps/` and `logs/`.
// Derived from this module's own location rather than the working directory,
// because service managers (launchd, systemd, Task Scheduler) start the
// process with a working directory of their own choosing.
const getProjectRoot = () => {
  if (process.env.JAS_HOME) return path.resolve(process.env.JAS_HOME)
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
}

export {
  getProjectRoot
}
