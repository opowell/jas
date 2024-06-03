import Weapon from "./Weapon.js"
import { randomElement } from "./utils.js"

const DEFINITIONS = {
  MACE: {
    name: 'mace',
    prob: 0.6,
    damage: '2d4'
  },
  LONG_SWORD: {
    name: 'long sword',
    prob: 0.3,
    damage: '3d4'
  },
  TWO_HANDED_SWORD: {
    name: 'two-handed sword',
    prob: 0.1,
    damage: '4d4'
  }
}

export const getWeapon = (weaponType) => {
  if (!weaponType) {
    weaponType = randomElement(DEFINITIONS, def => def.prob)
  }
  console.log('weaponType', weaponType)
  return new Weapon(weaponType)
}

export const spawnMace = () => {
  return new Weapon(DEFINITIONS.MACE)
}
