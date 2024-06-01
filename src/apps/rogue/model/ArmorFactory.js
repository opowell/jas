import Armor from "./Armor.js"

const TYPES = {
  CHAIN_MAIL: 'chain mail',
  RING_MAIL: 'ring mail'
}

export default class ArmorFactory {
  static getArmor(armorType) {
    if (!armorType) {
      const x = Math.random()
      if (x < 0.5) {
        armorType = TYPES.CHAIN_MAIL
      } else {
        armorType = TYPES.RING_MAIL
      }
    }
    return new Armor(armorType)
  }
}