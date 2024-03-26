import GameCell from './GameCell.js'
import GameObject from './GameObject.js'
class Game {
  constructor(width, height) {
    this.height = height
    this.width = width
    this.cells = []
    for (let i = 0; i < width; i++) {
      const col = []
      this.cells.push(col)
      for (let j = 0; j < height; j++) {
        col.push(new GameCell(i, j))
      }
    }
    this.objects = []
    this.player = this.createObject(10, 10)
  }
  createObject(x, y) {
    const object = new GameObject()
    this.objects.push(object)
    this.cells[x][y].objects.push(object)
    object.location = this.cells[x][y]
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        this.cells[i][j].visible = true
      }
    }
    return object
  }
  moveUp() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x][this.player.location.y-1])
  }
  moveDown() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x][this.player.location.y+1])
  }
  moveLeft() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x-1][this.player.location.y])
  }
  moveRight() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x+1][this.player.location.y])
  }
  moveUpLeft() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x-1][this.player.location.y-1])
  }
  moveDownLeft() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x-1][this.player.location.y+1])
  }
  moveUpRight() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x+1][this.player.location.y-1])
  }
  moveDownRight() {
    this.movePlayer(this.player.location, this.cells[this.player.location.x+1][this.player.location.y+1])
  }
  movePlayer(from, to) {
    let x = from.x
    let y = from.y
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        this.cells[i][j].visible = false
      }
    }
    x = to.x
    y = to.y
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        this.cells[i][j].visible = true
      }
    }
    from.objects = from.objects.filter(o => o !== this.player)
    to.objects.push(this.player)
    this.player.location = to
  }
}
export default Game