import Weapon from "./Weapon.js"

const DEFINITIONS = {
  MACE: {
    name: 'mace',
    prob: 0.6
  },
  LONG_SWORD: {
    name: 'long sword',
    prob: 0.3
  },
  TWO_HANDED_SWORD: {
    name: 'two-handed sword',
    prob: 0.1
  }
}

const CUM_PROBS = []
const defKeys = Object.keys(DEFINITIONS)
let sum = 0
for (let i = 0; i < defKeys.length; i++) {
  sum += DEFINITIONS[defKeys[i]].prob
  CUM_PROBS[i] = sum
}

export const spawnWeapon = () => {
  const weapon = new Weapon()
  const x = Math.random()
  for (let i = 0; i < CUM_PROBS.length; i++) {
    if (x < CUM_PROBS[i]) {
      weapon.name = DEFINITIONS[defKeys[i]].name
      break
    }
  }
  return weapon
}
