import GameCell from './GameCell.js'
import GameObject from './GameObject.js'
import Room from './Room.js'
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
    this.player = this.createPlayer(30, 20)
    this.addRoom(24, 17, 10, 6)
    this.createGold(26, 19, 500)
  }
  addRoom(x, y, w, h) {
    const room = new Room(x, y, w, h)
    this.cells[x][y].type = 'downRightWall'
    this.cells[x + w][y].type = 'downLeftWall'
    this.cells[x][y + h].type = 'upRightWall'
    this.cells[x + w][y + h].type = 'upLeftWall'
    for (let i = x + 1; i < x + w; i++) {
      this.cells[i][y].type = 'horizontalWall'
      this.cells[i][y+h].type = 'horizontalWall'
    }
    for (let i = x; i <= x + w; i++) {
      for (let j = y; j <= y + h; j++) {
        this.cells[i][j].room = room
      }
    }
    for (let i = y + 1; i < y + h; i++) {
      this.cells[x][i].type = 'verticalWall'
      this.cells[x+w][i].type = 'verticalWall'
    }
    this.cells[x + 2][y].type = 'door'
    this.cells[x][y + 2].type = 'door'
  }
  createGold(x, y, amount) {
    const object = this.createObject(x, y)
    object.type = 'gold'
  }
  createObject(x, y) {
    const object = new GameObject()
    this.objects.push(object)
    const location = this.cells[x][y]
    location.objects.push(object)
    object.location = location
    return object
  }
  createPlayer(x, y) {
    const object = this.createObject(x, y)
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
    if (to.type?.includes('Wall')) return
    let x = from.x
    let y = from.y
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        const cell = this.cells[i][j]
        if (cell.type) continue
        this.cells[i][j].visible = false
      }
    }
    x = to.x
    y = to.y
    if (to.room) {
      for (let i = x - 1; i < x + 2; i++) {
        for (let j = y - 1; j < y + 2; j++) {
          const cell = this.cells[i][j]
          if (cell.room === to.room) {
            cell.visible = true
          }
        }
      }
    } else {
      to.visible = true
    }
    from.objects = from.objects.filter(o => o !== this.player)
    to.objects.push(this.player)
    this.player.location = to
  }
}
export default Game