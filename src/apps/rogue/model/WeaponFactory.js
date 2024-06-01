import Weapon from "./Weapon.js"

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

const CUM_PROBS = []
const defKeys = Object.keys(DEFINITIONS)
let sum = 0
for (let i = 0; i < defKeys.length; i++) {
  sum += DEFINITIONS[defKeys[i]].prob
  CUM_PROBS[i] = sum
}

export const spawnWeapon = (weaponType) => {
  if (!weaponType) {
    const x = Math.random()
    for (let i = 0; i < CUM_PROBS.length; i++) {
      if (x < CUM_PROBS[i]) {
        weaponType = DEFINITIONS[defKeys[i]]
        break
      }
    }
  }
  return new Weapon(weaponType)
}

export const spawnMace = () => {
  return new Weapon(DEFINITIONS.MACE)
}
