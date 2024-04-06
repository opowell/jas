<template>
  <div class="game-screen" @keydown="handleKeydown" tabindex="0" ref="screen">
    <GameMessage :message="message" :show-more="game.messages.length > 1"/>
    <div class="map">
      <GameLocation
        v-for="location in visibleLocations"
        :key="location.x + '-' + location.y"
        :location="location"
      />
    </div>
  </div>
</template>
<script>
import Location from './Location.vue'
import Message from './Message.vue'
const LOCATION = {
  WIDTH: 14,
  HEIGHT: 22.4
}
export default {
  name: 'GameScreen',
  components: {
    GameLocation: Location,
    GameMessage: Message
  },
  props: {
    game: { type: Object, required: true }
  },
  computed: {
    message() {
      if (this.game.messages.length > 0) {
        return this.game.messages[0]
      }
      return ''
    },
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
      if (this.game.messages.length > 1 && event.key !== ' ') {
        return
      }
      if (this.game.messages.length === 1) {
        this.game.clearCurrentMessage()
      }
      switch (event.key) {
        case ' ':
          this.game.clearCurrentMessage()
          break
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
  background-color: black;
  font-family: IBMVGA8;
}
@font-face {
  font-family: "IBMVGA8";
  src: url("Web437_IBM_VGA_8x14.woff") format('woff');
  /* src: url("WebPlus_IBM_BIOS.woff") format('woff'); */
}
.map {
  width: v-bind(screenWidth);
  height: v-bind(screenHeight);
  position: relative;
}
</style>