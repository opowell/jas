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
  WIDTH: 16,
  HEIGHT: 16
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
    }
  },
  mounted() {
    this.$refs.screen.focus()
  },
  methods: {
    cellContent(cell) {
      if (cell.objects.length > 0) {
        return '@'
      }
      return '&#8231'
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
    square(cell) {
      const color = cell.objects.length > 0 ? 'yellow' : 'green'
      return {
        color,
        top: cell.y * SQUARE.HEIGHT + 'px',
        left: cell.x * SQUARE.WIDTH + 'px',
      }
    }
  }
}
</script>
<style scoped>
.game-screen {
  width: 50rem;
  height: 50rem;
  background-color: black;
  position: relative;
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