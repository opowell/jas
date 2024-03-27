<template>
  <div class="game-screen" @keydown="handleKeydown" tabindex="0" ref="screen">
    <div
      v-for="location in visibleLocations"
      :key="location.x + '-' + location.y"
      :style="locationStyle(location)"
      class="location"
      v-html="locationContent(location)"
    />
  </div>
</template>
<script>
const LOCATION = {
  WIDTH: 11.25,
  HEIGHT: 18
}
export default {
  name: 'GameScreen',
  props: {
    game: { type: Object, required: true }
  },
  data() {
    return {
      locationWidth: LOCATION.WIDTH + 'px',
      locationHeight: LOCATION.HEIGHT + 'px'
    }
  },
  computed: {
    locations() {
      return this.game.locations.flat()
    },
    visibleLocations() {
      return this.locations.filter(location => location.visible)
    },
    screenWidth() {
      return this.game.width * LOCATION.WIDTH + 'px'
    },
    screenHeight() {
      return this.game.height * LOCATION.HEIGHT + 'px'
    }
  },
  mounted() {
    this.$refs.screen.focus()
  },
  methods: {
    locationContent(location) {
      if (location.character) {
        return '@'
      }
      if (location.item) {
        if (location.item.type === 'gold') {
          return '&#x273D;'
        }
      }
      switch (location.type) {
        case 'hallway':
          return ''
        case 'floor':
          return '&#8231;'
        case 'upLeftWall':
          return '&#x255D;'
        case 'upRightWall':
          return '&#x255A;'
        case 'downLeftWall':
          return '&#x2557;'
        case 'downRightWall':
          return '&#x2554;'
        case 'horizontalWall':
          return '&#x2550;'
        case 'verticalWall':
          return '&#x2551;'
        case 'door':
          return '&#x256C;'
        default:
          return ''
      }
    },
    handleKeydown(event) {
      switch (event.key) {
        case 'h':
          this.game.moveLeft()
          break
        case 'j':
          this.game.moveDown()
          break
        case 'k':
          this.game.moveUp()
          break
        case 'l':
          this.game.moveRight()
          break
        case 'z':
          this.game.moveUpLeft()
          break
        case 'b':
          this.game.moveDownLeft()
          break
        case 'u':
          this.game.moveUpRight()
          break
        case 'n':
          this.game.moveDownRight()
          break
      }
    },
    getBackgroundColor(location) {
      if (location.type === 'hallway') {
        return 'grey'
      }
      return ''
    },
    getColor(location) {
      if (location.item) {
        if (location.item.type === 'gold') {
          return 'gold'
        }
      }
      if (location.character) {
        return 'yellow'
      }
      if (location.type === 'floor') return 'green'
      if (location.type !== 'floor') return 'brown'
      return
    },
    locationStyle(location) {
      return {
        color: this.getColor(location),
        'background-color': this.getBackgroundColor(location),
        top: location.y * LOCATION.HEIGHT + 'px',
        left: location.x * LOCATION.WIDTH + 'px',
      }
    }
  }
}
</script>
<style scoped>
.game-screen {
  width: v-bind(screenWidth);
  height: v-bind(screenHeight);
  background-color: black;
  position: relative;
  font-family: 'Courier New';
}
.location {
  width: v-bind(locationWidth);
  height: v-bind(locationHeight);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: v-bind(locationHeight);
}
</style>