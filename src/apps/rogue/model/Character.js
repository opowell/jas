import GameObject from './GameObject.js'
const { computed, ref } = Vue

class Character extends GameObject {
  constructor(game) {
    super()
    this.game = game
    this.items = []
    this.strength = {
      current: 16,
      maximum: 16
    }
    this.hits = {
      current: 12,
      maximum: 12
    }
    this.level = computed(() => {
      const xp = this.experience.value
      if (xp < 10) {
        return 1
      }
      return Math.floor(Math.log10(xp))
    })
    this.experience = ref(0)
    this.gold = 0
  }
  /**
   * 
   * @param {Location} location 
   * @returns whether or not item is in the current location
   */
  moveTo(location) {
    this.location = location
    const item = location.item
    if (!item) {
      return false
    }
    if (item.type !== 'staircase') {
      if (item.type === 'gold') {
        this.gold += item.amount
        this.game.addMessage('You picked up ' + item.amount + ' pieces of gold.')
        location.item = null
      }
      else if (this.items.length > 25) {
        this.game.addMessage('Your pack is full.')
      } else {
        this.items.push(item)
        this.game.addMessage('You picked up a ' + item.type)
        location.item = null
      }
    } 
    return true
  }
}
export default Character