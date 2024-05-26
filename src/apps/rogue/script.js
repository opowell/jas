const options = {
  moduleCache: {
      vue: Vue
  },
  async getFile(url) {
      const res = await fetch(url);
      if ( !res.ok )
          throw Object.assign(new Error(res.statusText + ' ' + url), { res });
      return {
          getContentData: asBinary => asBinary ? res.arrayBuffer() : res.text(),
      }
  },
  addStyle(textContent) {
      const style = Object.assign(document.createElement('style'), { textContent });
      const ref = document.head.getElementsByTagName('style')[0] || null;
      document.head.insertBefore(style, ref);
  },
}
const { loadModule } = window['vue3-sfc-loader']

function exposeToWindow(object) {
  Object.keys(object).forEach(key => {
    window.launchpad[key] = object[key]
  })
}

import Game from './model/Game.js'
window.launchpad = {}
window.launchpad.init = () => {
  const { createApp, ref } = Vue
  createApp({
    components: {
      'GameScreen': Vue.defineAsyncComponent( () => loadModule('./view/GameScreen.vue', options) )
    },
    setup() {
      const game = ref(new Game())
      const out = {
        game
      }
      exposeToWindow(out)
      return out
    }
  }).mount('#app')
}

window.launchpad.init()