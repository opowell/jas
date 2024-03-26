<template>
  <div class="game-screen" @keydown="handleKeydown" tabindex="0" ref="screen">
    <div
      v-for="cell in visibleCells"
      :key="cell.x + '-' + cell.y"
      :style="square(cell)"
      class="cell"
      v-html="cellContent(cell)"
    />
  </div>
</template>
<script>
const SQUARE = {
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
      cellWidth: SQUARE.WIDTH + 'px',
      cellHeight: SQUARE.HEIGHT + 'px'
    }
  },
  computed: {
    cells() {
      return this.game.cells.flat()
    },
    visibleCells() {
      return this.cells.filter(cell => cell.visible)
    },
    screenWidth() {
      return this.game.width * SQUARE.WIDTH + 'px'
    },
    screenHeight() {
      return this.game.height * SQUARE.HEIGHT + 'px'
    }
  },
  mounted() {
    this.$refs.screen.focus()
  },
  methods: {
    cellContent(cell) {
      if (cell.objects.length > 0) {
        if (cell.objects[0].type === 'gold') {
          return '&#x273D;'
        }
        return '@'
      }
      switch (cell.type) {
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
          return '&#8231;'
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
    getColor(cell) {
      if (cell.objects.length > 0) {
        if (cell.objects[0].type === 'gold') {
          return 'gold'
        }
        return 'yellow'
      }
      if (cell.type) return 'brown'
      return 'green'
    },
    square(cell) {
      return {
        color: this.getColor(cell),
        top: cell.y * SQUARE.HEIGHT + 'px',
        left: cell.x * SQUARE.WIDTH + 'px',
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
.cell {
  width: v-bind(cellWidth);
  height: v-bind(cellHeight);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: v-bind(cellHeight);
}
</style>