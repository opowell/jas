import Item from "./Item.js"
const { computed } = Vue
const ARMOR_LEVELS = {
  'ring mail': 4,
  'chain mail': 6
}

class Armor extends Item {
  constructor(armorType) {
    super({
      type: 'armor',
      armorType,
      bonus: 0,
      identified: false
    })
    this.baseDefence = computed(() => {
      return ARMOR_LEVELS[this.armorType]
    })
    this.defence = computed(() => {
      return this.baseDefence.value + this.bonus
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