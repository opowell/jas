import Location from './Location.js'
import GameObject from './GameObject.js'
import Room from './Room.js'

function isDiagonalMove(a, b) {
  return Math.abs(Math.abs(a.x - b.x) - Math.abs(a.y - b.y)) === 0
}

function isWall(location) {
  return location.type?.includes('Wall')
}

class Game {
  constructor(width, height) {
    this.height = height
    this.width = width
    this.locations = []
    for (let i = 0; i < width; i++) {
      const col = []
      this.locations.push(col)
      for (let j = 0; j < height; j++) {
        col.push(new Location(i, j))
      }
    }
    this.objects = []
    this.items = []
    this.characters = []
    this.player = this.createPlayer(30, 20)
    this.addRoom(24, 17, 10, 6)
    this.createGold(26, 19, 500)
  }
  addRoom(x, y, w, h) {
    const room = new Room(x, y, w, h)
    this.locations[x][y].type = 'downRightWall'
    this.locations[x + w][y].type = 'downLeftWall'
    this.locations[x][y + h].type = 'upRightWall'
    this.locations[x + w][y + h].type = 'upLeftWall'
    for (let i = x + 1; i < x + w; i++) {
      this.locations[i][y].type = 'horizontalWall'
      this.locations[i][y+h].type = 'horizontalWall'
    }
    for (let i = x; i <= x + w; i++) {
      for (let j = y; j <= y + h; j++) {
        this.locations[i][j].room = room
      }
    }
    for (let i = x+1; i < x + w; i++) {
      for (let j = y+1; j < y + h; j++) {
        this.locations[i][j].type = 'floor'
      }
    }
    for (let i = y + 1; i < y + h; i++) {
      this.locations[x][i].type = 'verticalWall'
      this.locations[x+w][i].type = 'verticalWall'
    }
    this.locations[x + 2][y].type = 'door'
    this.locations[x + 2][y-1].type = 'hallway'
    this.locations[x + 2][y-2].type = 'hallway'
    this.locations[x][y + 2].type = 'door'
  }
  hasWallBetween(a, b) {
    return isWall(this.locations[a.x][b.y]) || isWall(this.locations[b.x][a.y])
  }
  createGold(x, y, amount) {
    const object = this.createItem(x, y)
    object.type = 'gold'
  }
  createItem(x, y) {
    const object = new GameObject()
    const location = this.locations[x][y]
    location.item = object
    object.location = location
    return object
  }
  createCharacter(x, y) {
    const object = new GameObject()
    const location = this.locations[x][y]
    location.character = object
    object.location = location
    return object
  }
  createPlayer(x, y) {
    const object = this.createCharacter(x, y)
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        this.locations[i][j].visible = true
      }
    }
    return object
  }
  moveUp() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x][this.player.location.y-1])
  }
  moveDown() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x][this.player.location.y+1])
  }
  moveLeft() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x-1][this.player.location.y])
  }
  moveRight() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x+1][this.player.location.y])
  }
  moveUpLeft() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x-1][this.player.location.y-1])
  }
  moveDownLeft() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x-1][this.player.location.y+1])
  }
  moveUpRight() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x+1][this.player.location.y-1])
  }
  moveDownRight() {
    this.movePlayer(this.player.location, this.locations[this.player.location.x+1][this.player.location.y+1])
  }
  movePlayer(from, to) {
    if (isWall(to)) return
    if (isDiagonalMove(from, to) && this.hasWallBetween(from, to)) {
      return
    }
    let x = from.x
    let y = from.y
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        const cell = this.locations[i][j]
        if (cell.type === 'floor') {
          this.locations[i][j].visible = false
        }
      }
    }
    x = to.x
    y = to.y
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        this.locations[i][j].visible = true
      }
    }
    from.character = null
    to.character = this.player
    this.player.location = to
  }
}
export default Game