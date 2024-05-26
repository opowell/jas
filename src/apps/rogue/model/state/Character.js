import GameObject from './GameObject.js'

class Character extends GameObject {
  constructor(stateObj) {
    super(stateObj)
    this.items = [...stateObj.items]
    this.strength = {
      current: stateObj.strength.current,
      maximum: stateObj.strength.maximum
    }
    this.hits = {
      current: stateObj.hits.current,
      maximum: stateObj.hits.maximum
    }
    this.experience = stateObj.experience
    this.gold = stateObj.gold
  }
  toJson() {
    return {
      gold: this.gold,
      items: this.items,
      strength: this.strength,
      hits: this.hits,
      experience: this.experience
    }
  }
}
export default Character