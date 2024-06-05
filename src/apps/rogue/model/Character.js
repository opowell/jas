import { TYPES as ARMOR_TYPES, getArmor } from './ArmorFactory.js'
import { TYPES as FOOD_TYPES, getFood } from './FoodFactory.js'
import GameObject from './GameObject.js'
import { spawnMace } from './WeaponFactory.js'
const { computed } = Vue

class Character extends GameObject {
  constructor(game) {
    super()
    this.addState({
      game,
      items: [],
      strength:  {
        current: 16,
        maximum: 16
      },
      hits: {
        current: 12,
        maximum: 12
      },
      experience: 0,
      gold: 0,
      weapon: null,
      armor: null
    })
    const ration = getFood(FOOD_TYPES.RATION)
    this.items.push(ration)
    const mace = spawnMace()
    mace.enchantHit()
    mace.enchantDamage()
    mace.identify()
    this.items.push(mace)
    const ringMail = getArmor(ARMOR_TYPES.RING_MAIL, false)
    ringMail.enchant()
    ringMail.identify()
    this.items.push(ringMail)
    this.numItems = computed(() => {
      return this.items.reduce((acc, value) => acc + value.quantity, 0)
    })
    this.level = computed(() => {
      const xp = this.experience
      if (xp < 10) {
        return 1
      }
      return Math.floor(Math.log10(xp))
    })
    this.canDrop = computed(() => {
      return this.location.canPlaceItem
    })
    this.armor = ringMail
    this.armorLevel = computed(() => {
      if (!this.armor) {
        return 2
      }
      return this.armor.defence
    })
    this.weapon = mace
    this.damage = computed(() => {
      if (!this.weapon) {
        return 0
      }
      if (this.weapon.identified) {
        if (this.weapon.damageBonus !== 0) {
          return this.weapon.damage + '+' + this.weapon.damageBonus
        }
        return this.weapon.damage
      }
      return this.weapon.damage + '+?'
    })
  }
  takeOffArmor() {
    if (!this.armor) {
      this.game.addMessage('You are not wearing any armor.')
      return
    }
    if (this.armor.cursed) {
      this.game.addMessage('Cannot remove armor, it seems to be cursed.')
      return
    }
    this.armor = null
    this.game.messages.push('Removed armor.')
  }
  wield(item) {
    this.weapon = item
  }
  wearArmor(item) {
    this.armor = item
    item.identified = true
  }
  dropItem(index) {
    const item = this.items.splice(index, 1)[0]
    this.location.item = item
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
      else if (this.numItems > 25) {
        this.game.addMessage('Your pack is full.')
      } else {
        const matchingItem = this.items.find(i => {
          if (!i.matchesForInventory) {
            console.log('huh?', i, item)
            return false
          }
          return i.matchesForInventory(item)
        })
        if (matchingItem) {
          matchingItem.quantity++
        } else {
          this.items.push(item)
        }
        this.game.addMessage('You picked up ' + (item.label || ('a ' + item.type)))
        location.item = null
      }
    } 
    return true
  }
  getCurrentVisibleItems() {
    const out = {
      visible: {},
      touchable: []
    }
    if (this.location.room && this.location.room.lit) {
      this.location.room.locations.forEach(location => {
        if (location.type === 'door') {
          out.visible[location.x + '-' + location.y] = 'door'
        }
      })
    }
    const x = this.location.x
    const y = this.location.y
    const touchableLocations = []
    const game = this.game
    touchableLocations.push(game.locations[x-1][y])
    touchableLocations.push(game.locations[x][y-1])
    touchableLocations.push(game.locations[x][y])
    touchableLocations.push(game.locations[x][y+1])
    touchableLocations.push(game.locations[x+1][y])
    if (!this.location.isHallway) {
      touchableLocations.push(game.locations[x-1][y-1])
      touchableLocations.push(game.locations[x-1][y+1])
      touchableLocations.push(game.locations[x+1][y-1])
      touchableLocations.push(game.locations[x+1][y+1])
    }
    touchableLocations.forEach(location => {
      if (location.type === 'door') {
        out.touchable.push('door')
      }
      if (location.item?.type === 'staircase') {
        out.touchable.push('staircase')
      }
    })
    out.touchable.sort()
    return out
  }
  currentVisibilityMatches(oldItems) {
    const currentItems = this.getCurrentVisibleItems()
    const allVisibleKeys = {}
    Object.keys(currentItems.visible).forEach(key => allVisibleKeys[key] = true)
    Object.keys(oldItems.visible).forEach(key => allVisibleKeys[key] = true)
    const hasNewVisibility = Object.keys(allVisibleKeys).some(key => {
      if (currentItems.visible[key] && currentItems.visible[key] !== oldItems.visible[key]) {
        return true
      }
      return false
    })
    if (hasNewVisibility) {
      return false
    }
    if (currentItems.touchable.length && (currentItems.touchable.length > oldItems.touchable.length || currentItems.touchable.some((item, index) => item !== oldItems.touchable[index]))) {
      return false
    }
    return true
  }
}
export default Character