<template>
  <div class="game-screen" @keydown="handleKeydown" tabindex="0" ref="screen">
    <div class="column1">
      <div v-if="player" class="section">
        <div class="section-title">Player</div>
        <div v-for="item in characterItems" class="section-row" :key="item.label">
          <div class="section-row-label">{{ item.label }}</div>
          <div class="section-row-value">{{ item.value }}</div>
        </div>
      </div>
      <div class="section">
        <div class="section-title">Inventory</div>
        <div class="section-row" v-for="(item, index) in game.player.items" :key="index">
          <div class="section-row-label">{{ alphabet[index] + ') ' + item.type }}</div>
          <div class="section-row-value">1</div>
        </div>
      </div>
    </div>
    <div class="column2">
      <GameMessage :message="message" :show-more="game.messages.length > 1"/>
      <div class="map">
        <GameLocation
          v-for="location in visibleLocations"
          :key="location.x + '-' + location.y"
          :location="location"
        />
      </div>
    </div>
  </div>
</template>
<script>
import Location from './Location.vue'
import Message from './Message.vue'
const LOCATION = {
  WIDTH: 12,
  HEIGHT: 21
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
  data() {
    return {
      alphabet: 'abcdefghijklmnopqrstuvwxyz'
    }
  },
  computed: {
    player() {
      return this.game?.player
    },
    characterItems() {
      const player = this.player
      if (!player) return []
      return [
        {
          label: 'Level',
          value: this.game.level
        },
        {
          label: 'Hits',
          value: player.hits.current + '(' + player.hits.maximum + ')'
        },
        {
          label: 'Strength',
          value: player.strength.current + '(' + player.strength.maximum + ')'
        },
        {
          label: 'Gold',
          value: player.gold
        },
        {
          label: 'Armor',
          value: player.armor
        },
        {
          label: 'Exp',
          value: player.level + '/' + player.experience
        }  
      ]
    },
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
      return this.locations
      // return this.locations.filter(location => {
      //   return location.visible ||
      //     (
      //       location.mapped &&
      //       (
      //         location.room?.lit ||
      //         location.item?.type === 'staircase'
      //       )
      //     )
      // })
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
        case ':':
          this.game.goDownStairs()
          break
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
.section-title {
  color: #555;
}
.section-row {
  display: flex;
  color: lightgray;
}
.section-row-label {
  flex: 1 1 auto;
}
.section-row-value {
  flex: 0 0 auto;
}
.column1 {
  flex: 0 0 150px;
  gap: 1rem;
  display: flex;
  flex-direction: column;
}
.column2 {
  flex: 1 1 auto;
}
.game-screen {
  background-color: black;
  font-family: IBMVGA8;
  display: flex;
  gap: 2rem;
  padding: 2rem;
}
@font-face {
  font-family: "IBMVGA8";
  /* src: url("WebPlus_IBM_VGA_9x16.woff") format('woff'); */
  /* src: url("WebPlus_IBM_VGA_9x14.woff") format('woff'); */
  /* src: url("WebPlus_IBM_VGA_8x14.woff") format('woff'); */
  /* src: url("Web437_IBM_VGA_8x14.woff") format('woff'); */
  /* src: url("Web437_IBM_VGA_9x14.woff") format('woff'); */
  src: url("Web437_IBM_VGA_9x16.woff") format('woff');
}
.map {
  width: v-bind(screenWidth);
  height: v-bind(screenHeight);
  position: relative;
}
</style>