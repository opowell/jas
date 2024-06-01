import Item from "./Item.js"

class Potion extends Item {
  constructor(potionType) {
    super({
      type: 'potion',
      potionType
    })
  }
  get label() {
    if (this.quantity === 1) {
      return 'a potion'
    }
    return this.quantity + ' potions'
  }
  matchesForInventory(item) {
    return item.type === 'potion' && item.potionType === this.potionType
  }
}
export default Potion