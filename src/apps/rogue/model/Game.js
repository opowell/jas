import Location from './Location.js'
import GameObject from './GameObject.js'
import Room from './Room.js'

function isDiagonalMove(a, b) {
  return Math.abs(Math.abs(a.x - b.x) - Math.abs(a.y - b.y)) === 0
}

function isWall(location) {
  return location.type?.includes('Wall')
}

const WIDTH = 60
const HEIGHT = 30

/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns a random integer from [x, y].
 */
const randomInt = (x, y = 0) => {
  const min = Math.min(x, y)
  const dist = Math.abs(x - y)
  return Math.round(Math.random() * dist) + min
}
/**
 * 
 * @param {Array} array
 * @returns a random element from the array.
 */
const randomElement = (array) => {
  if (array.length === 0) return
  const index = randomInt(array.length - 1)
  return array[index]
}

class Game {
  constructor() {
    this.width = WIDTH
    this.height = HEIGHT
    this.locations = []
    this.objects = []
    this.items = []
    this.characters = []
    this.createLocations()
    this.addRooms()
    this.player = this.createPlayer()
    this.createStaircase()
    this.createGold(26, 19, 500)
  }
  createLocations() {
    for (let i = 0; i < this.width; i++) {
      const col = []
      this.locations.push(col)
      for (let j = 0; j < this.height; j++) {
        col.push(new Location(i, j))
      }
    }
  }
  addRooms() {
    const minWidth = 4
    const minHeight = 4
    for (let i = 0; i < 3; i++) {
      const minX = i * WIDTH / 3
      const maxX = minX + WIDTH / 3 - 1 - (i < 2 ? 1 : 0)
      for (let j = 0; j < 3; j++) {
        const minY = j * HEIGHT / 3
        const maxY = minY + HEIGHT / 3 - 1 - (j < 2 ? 1 : 0)
        let x = randomInt(minX, maxX)
        let y = randomInt(minY, maxY)
        let goRight = Math.random() > 0.5
        let goDown = Math.random() > 0.5
        if (maxX - x < minWidth) {
          goRight = false
        }
        if (x - minX < minWidth) {
          goRight = true
        }
        if (maxY - y < minHeight) {
          goDown = false
        }
        if (y - minY < minHeight) {
          goDown = true
        }
        let width = randomInt(minWidth, goRight ? maxX - x : x - minX)
        let height = randomInt(minHeight, goDown ? maxY - y : y - minY)
        if (!goRight) {
          x = x - width
        }
        if (!goDown) {
          y = y - height
        }
        this.addRoom(x, y, width, height)
      }
    }
  }
  addRoom(x, y, w, h) {
    w = w - 1
    h = h - 1
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
        room.locations.push(this.locations[i][j])
        this.locations[i][j].visible = true
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
    if (x + 2 < WIDTH) {
      this.locations[x + 2][y].type = 'door'
      if (y > 0) {
        this.locations[x + 2][y-1].type = 'hallway'
      }
      if (y > 1) {
        this.locations[x + 2][y-2].type = 'hallway'
      }
    }
    if (y + 2 < HEIGHT) {
      this.locations[x][y + 2].type = 'door'
    }
  }
  hasWallBetween(a, b) {
    return isWall(this.locations[a.x][b.y]) || isWall(this.locations[b.x][a.y])
  }
  createGold(x, y, amount) {
    const item = this.createItem(x, y)
    item.type = 'gold'
  }
  createStaircase() {
    const locations = this.locations.flat().filter(location => !location.item && location.type === 'floor')
    const location = randomElement(locations)
    const item = this.createItem(location.x, location.y)
    item.type = 'staircase'
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
  createPlayer() {
    const locations = this.locations.flat().filter(location => !location.character && location.type === 'floor')
    const location = randomElement(locations)
    const x = location.x
    const y = location.y
    const object = this.createCharacter(x, y)
    for (let i = x - 1; i < x + 2; i++) {
      for (let j = y - 1; j < y + 2; j++) {
        this.locations[i][j].visible = true
      }
    }
    return object
  }
  moveUp() {
    const location = this.player.location
    if (location.y === 0) return
    this.movePlayer(location, this.locations[location.x][location.y-1])
  }
  moveDown() {
    const location = this.player.location
    if (location.y === this.height - 1) return
    this.movePlayer(location, this.locations[location.x][location.y+1])
  }
  moveLeft() {
    const location = this.player.location
    if (location.x === 0) return
    this.movePlayer(location, this.locations[location.x-1][location.y])
  }
  moveRight() {
    const location = this.player.location
    if (location.x === this.width - 1) return
    this.movePlayer(location, this.locations[location.x+1][location.y])
  }
  moveUpLeft() {
    const location = this.player.location
    if (location.x === 0) return
    if (location.y === 0) return
    this.movePlayer(location, this.locations[location.x - 1][location.y - 1])
  }
  moveDownLeft() {
    const location = this.player.location
    if (location.x === 0) return
    if (location.y === this.height - 1) return
    this.movePlayer(location, this.locations[location.x-1][location.y+1])
  }
  moveUpRight() {
    const location = this.player.location
    if (location.x === this.width - 1) return
    if (location.y === 0) return
    this.movePlayer(location, this.locations[location.x+1][location.y-1])
  }
  moveDownRight() {
    const location = this.player.location
    if (location.x === this.width - 1) return
    if (location.y === this.height - 1) return
    this.movePlayer(location, this.locations[location.x+1][location.y+1])
  }
  movePlayer(from, to) {
    if (isWall(to)) return
    if (isDiagonalMove(from, to) && this.hasWallBetween(from, to)) {
      return
    }
    let x = from.x
    let y = from.y
    for (let i = Math.max(x - 1, 0); i < Math.min(x + 2, this.width); i++) {
      for (let j = Math.max(y - 1, 0); j < Math.min(y + 2, this.height); j++) {
        const cell = this.locations[i][j]
        if (cell.type === 'floor') {
          this.locations[i][j].visible = false
        }
      }
    }
    x = to.x
    y = to.y
    for (let i = Math.max(x - 1, 0); i < Math.min(x + 2, this.width); i++) {
      for (let j = Math.max(y - 1, 0); j < Math.min(y + 2, this.height); j++) {
        this.locations[i][j].visible = true
      }
    }
    from.character = null
    to.character = this.player
    this.player.location = to
  }
}
export default Game