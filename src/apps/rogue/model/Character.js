import GameObject from './GameObject.js'
class Character extends GameObject {
  constructor(game) {
    super()
    this.game = game
    this.items = []
  }
  moveTo(location) {
    this.location = location
    const item = location.item
    if (item && item.type !== 'staircase') {
      this.items.push(item)
      this.game.addMessage('You picked up a ' + item.type)
      location.item = null
    }
  }
}
export default Character