<template>
  <div class="game-screen" @keydown="handleKeydown" tabindex="0" ref="screen">
    <GameLocation
      v-for="location in visibleLocations"
      :key="location.x + '-' + location.y"
      :location="location"
    />
  </div>
</template>
<script>
import GameLocation from './GameLocation.vue'
const LOCATION = {
  WIDTH: 14,
  HEIGHT: 22.4
}
export default {
  name: 'GameScreen',
  components: {
    GameLocation
  },
  props: {
    game: { type: Object, required: true }
  },
  computed: {
    locations() {
      return this.game.locations.flat()
    },
    visibleLocations() {
      return this.locations.filter(location => {
        return location.visible ||
          (
            location.mapped &&
            (
              location.room?.lit ||
              location.item?.type === 'staircase'
            )
          )
      })
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
    handleKeydown(event) {
      switch (event.key) {
        case 'H':
          this.game.runLeft()
          break
        case 'J':
          this.game.runDown()
          break
        case 'K':
          this.game.runUp()
          break
        case 'L':
          this.game.runRight()
          break
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
</style>