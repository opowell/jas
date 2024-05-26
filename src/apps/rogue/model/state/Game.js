import Location from './Location.js'
import Character from './Character.js'

class Game {
  constructor(stateObj) {
    this.width = stateObj.width
    this.height = stateObj.heigth
    this.level = stateObj.level
    this.locations = []
    stateObj.locations.forEach(locationRow => {
      const row = []
      this.locations.push(row)
      locationRow.forEach(entry => {
        row.push(new Location(entry))
      })
    })
    this.messages = [...stateObj.messages]
    this.rooms = []
    this.player = new Character(stateObj.player)
  }
  toJson() {
    return {
      width: this.width,
      height: this.height,
      level: this.level,
      locations: this.locations.map(locationRow => {
        return locationRow.map(entry => entry.toJson())
      }),
      messages: this.messages,
      rooms: this.rooms.map(room => room.toJson()),
      player: this.playerToJson()
    }
  }
  playerToJson() {
    if (!this.player) return undefined
    return this.player.toJson()
  }
}
export default Game