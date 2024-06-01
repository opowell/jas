import Item from "./Item.js"

class Weapon extends Item {
  constructor(type) {
    super({
      weaponType: type.name,
      hitBonus: 0,
      damageBonus: 0,
      identified: false,
      damage: type.damage
    })
    this.type = 'weapon'
  }
  get label() {
    if (this.quantity === 1) {
      if (this.identified) {
        return 'a +' + this.hitBonus + ',+' + this.damageBonus + ' ' + this.weaponType 
      }
      return 'a ' + this.weaponType
    }
    return this.quantity + ' ' + this.weaponType + 's'
  }
  enchantDamage() {
    this.damageBonus++
  }
  enchantHit() {
    this.hitBonus++
  }
  identify() {
    this.identified = true
  }
}
export default Weapon