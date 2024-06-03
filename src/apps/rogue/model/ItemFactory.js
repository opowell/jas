import { getPotion } from "./PotionFactory.js"
import { getScroll } from "./ScrollFactory.js"
import { getWeapon } from "./WeaponFactory.js"
import { getArmor } from "./ArmorFactory.js"
import { randomElement } from "./utils.js"

const TYPES = {
  POTION: {
    factory: getPotion,
    prob: 27
  },
  SCROLL: {
    factory: getScroll,
    prob: 30
  },
  FOOD: {
    factory: getArmor,
    prob: 17
  },
  WEAPON: {
    factory: getWeapon,
    prob: 8
  },
  ARMOR: {
    factory: getArmor,
    prob: 8
  },
  RING: {
    factory: getArmor,
    prob: 5
  },
  STICK: {
    factory: getArmor,
    prob: 5
  }
}

export const getItem = () => {
  const type = randomElement(TYPES, def => def.prob)
  return type.factory()
}