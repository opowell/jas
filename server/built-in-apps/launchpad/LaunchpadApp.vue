<template>
  <div class="app" :class="{ selected }">
    <div class="app-icon">
      <img v-if="app.previewImage" :src="app.id + '/' + app.previewImage">
      <span v-else>{{ app.id[0].toUpperCase() }}</span></div>
    <div class="app-name">{{ app.id }}</div>
  </div>
</template>
<script>
function djb2(str) {
  var hash = 5381
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i) /* hash * 33 + c */
  }
  return hash;
}

function hashStringToColor(str) {
  const hash = djb2(str)
  const r = (hash & 0xFF0000) >> 16
  const g = (hash & 0x00FF00) >> 8
  const b = hash & 0x0000FF
  return "#" + ("0" + r.toString(16)).slice(-2) + ("0" + g.toString(16)).slice(-2) + ("0" + b.toString(16)).slice(-2)
}

const inv = (hex) => '#' + hex.match(/[a-f0-9]{2}/ig).map(e => (255 - parseInt(e, 16) | 0).toString(16).replace(/^([a-f0-9])$/, '0$1')).join('')

export default {
  name: 'LaunchpadApp',
  props: {
    app: { type: Object, required: true },
    selected: { type: Boolean, default: false }
  },
  computed: {
    bgColor() {
      return hashStringToColor(this.app.id)
    },
    color() {
      if (!this.bgColor) {
        return 'black'
      }
      return inv(this.bgColor)
    },
    fadedBgColor() {
      return this.bgColor + '4d'
    }
  }
}
</script>
<style scoped>
.app {
  display: flex;
  grid-gap: 0.5rem;
  width: 10rem;
  flex-direction: column;
  padding: 0.5rem;
  border: 2px solid transparent;
  border-radius: 0.5rem;
}
.app:hover {
  background-color: v-bind(fadedBgColor);
  cursor: pointer;
}
/* Keyboard selection: a pulsing border and wash so the highlighted app
   stands out against the tiles the mouse is merely hovering. */
.app.selected {
  animation: app-blink 1.1s ease-in-out infinite;
}
@keyframes app-blink {
  0%, 100% {
    border-color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.16);
  }
  50% {
    border-color: rgba(255, 255, 255, 0.15);
    background-color: transparent;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app.selected {
    animation: none;
    border-color: rgba(255, 255, 255, 0.9);
    background-color: rgba(255, 255, 255, 0.16);
  }
}
.app-icon {
  color: #fff;
  background-color: v-bind(bgColor);
  height: 9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
  opacity: 1;
  padding: 0.5rem;
}
.app-icon > img {
  max-width: 100%;
  max-height: 100%;
}
.app-name {
  color: white;
  display: flex;
  justify-content: center;
}
</style>