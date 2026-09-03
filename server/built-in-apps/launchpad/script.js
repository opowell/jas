async function getApps() {
  const apiUrl = 'http://' + window.location.host + '/apps'
  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      return response.json()
    })
    .catch(error => {
      console.error('Error:', error)
    })
}

const options = {
  moduleCache: {
    vue: Vue
  },
  async getFile(url) {
    const res = await fetch(url)
    if (!res.ok)
      throw Object.assign(new Error(res.statusText + ' ' + url), { res })
    return {
      getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
    }
  },
  addStyle(textContent) {
    const style = Object.assign(document.createElement('style'), { textContent })
    const ref = document.head.getElementsByTagName('style')[0] || null
    document.head.insertBefore(style, ref)
  },
}
const { loadModule } = window['vue3-sfc-loader']

// The rendered app tiles, in document order. The apps wrap into rows, so
// vertical moves are worked out from these positions rather than from a
// fixed column count.
const appElements = () => Array.from(document.querySelectorAll('.apps > .app'))
const centerOf = (el) => el.offsetLeft + el.offsetWidth / 2

window.launchpad = {}
window.launchpad.init = () => {
  getApps().then(loadedApps => {
    const { createApp, ref, onMounted, onUnmounted } = Vue
    createApp({
      components: {
        'LaunchpadApp': Vue.defineAsyncComponent( () => loadModule('./LaunchpadApp.vue', options) )
      },
      setup() {
        const apps = ref(loadedApps.filter(a => a.id !== 'launchpad'))
        // The first app starts highlighted, so the keyboard is usable
        // the moment the page loads.
        const selectedIndex = ref(0)
        const handleAppClick = (id) => {
          window.location.href = window.location.origin + '/' + id
        }

        const select = (index) => {
          selectedIndex.value = index
          const el = appElements()[index]
          if (el) {
            el.scrollIntoView({ block: 'nearest' })
          }
        }

        // Step one row up (-1) or down (+1), landing on the tile whose
        // horizontal centre is closest to the current one.
        const moveVertical = (step) => {
          const els = appElements()
          const current = els[selectedIndex.value]
          if (!current) {
            select(0)
            return
          }
          const rowTops = [...new Set(els.map(el => el.offsetTop))].sort((a, b) => a - b)
          const rowIndex = rowTops.indexOf(current.offsetTop) + step
          if (rowIndex < 0 || rowIndex >= rowTops.length) {
            return
          }
          const targetTop = rowTops[rowIndex]
          const currentCenter = centerOf(current)
          let best = -1
          let bestDistance = Infinity
          els.forEach((el, index) => {
            if (el.offsetTop !== targetTop) {
              return
            }
            const distance = Math.abs(centerOf(el) - currentCenter)
            if (distance < bestDistance) {
              bestDistance = distance
              best = index
            }
          })
          if (best !== -1) {
            select(best)
          }
        }

        const moveHorizontal = (step) => {
          const count = apps.value.length
          if (selectedIndex.value < 0) {
            select(step > 0 ? 0 : count - 1)
            return
          }
          const next = selectedIndex.value + step
          if (next >= 0 && next < count) {
            select(next)
          }
        }

        const handleKeydown = (event) => {
          if (event.metaKey || event.ctrlKey || event.altKey || !apps.value.length) {
            return
          }
          switch (event.key) {
            case 'ArrowRight':
              moveHorizontal(1)
              break
            case 'ArrowLeft':
              moveHorizontal(-1)
              break
            case 'ArrowDown':
              moveVertical(1)
              break
            case 'ArrowUp':
              moveVertical(-1)
              break
            case 'Home':
              select(0)
              break
            case 'End':
              select(apps.value.length - 1)
              break
            case 'Enter':
            case ' ':
              if (selectedIndex.value >= 0) {
                handleAppClick(apps.value[selectedIndex.value].id)
              }
              break
            case 'Escape':
              select(0)
              break
            default:
              return
          }
          event.preventDefault()
        }

        onMounted(() => window.addEventListener('keydown', handleKeydown))
        onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

        const out = {
          apps,
          selectedIndex,
          handleAppClick,
          select
        }
        Object.keys(out).forEach(key => {
          window.launchpad[key] = out[key]
        })
        return out
      }
    }).mount('#app')  
  })
}

window.launchpad.init()
