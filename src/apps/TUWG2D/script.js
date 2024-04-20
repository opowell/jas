const options = {
  moduleCache: {
    vue: Vue
  },
  addStyle(textContent) {
    const style = Object.assign(document.createElement('style'), { textContent })
    const ref = document.head.getElementsByTagName('style')[0] || null
    document.head.insertBefore(style, ref);
  },
}
const { loadModule } = window['vue3-sfc-loader']

window.launchpad = {}
window.launchpad.init = () => {
  const { createApp } = Vue
  createApp({
    components: {
      'App': Vue.defineAsyncComponent( () => loadModule('./views/vue3/App/App.vue', options) )
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