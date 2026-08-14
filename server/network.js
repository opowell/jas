import os from 'os'

// The first non-internal IPv4 address, so the URL printed at startup is
// reachable from other devices on the same network. Returns undefined when
// there is no such interface (offline, or only loopback available).
const getLocalAddress = () => {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === 'IPv4' && !address.internal) return address.address
    }
  }
  return undefined
}

export {
  getLocalAddress
}
