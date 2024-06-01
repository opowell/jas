import Item from "./Item.js"

class Armor extends Item {
  constructor(armorType) {
    super({
      type: 'armor',
      armorType,
      bonus: 0,
      identified: false
    })
  }
  get label() {
    if (this.identified) {
      return '+' + this.bonus + ' ' + this.armorType
    }
    return this.armorType
  }
  enchant() {
    this.bonus++
  }
  identify() {
    this.identified = true
  }
}
export default Armor