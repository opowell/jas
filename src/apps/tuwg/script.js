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

window.launchpad = {}
window.launchpad.init = () => {
  const { createApp, ref } = Vue
  createApp({
    components: {
      'LaunchpadApp': Vue.defineAsyncComponent( () => loadModule('./LaunchpadApp.vue', options) )
    },
    setup() {
    }
  }).mount('#app')  
  // const socket = io('/tuwg', {
  //   query: {
  //     test: 'foo'
  // }})
}

window.launchpad.init()