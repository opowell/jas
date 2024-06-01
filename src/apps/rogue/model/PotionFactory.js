import Potion from "./Potion.js"
import { randomElement } from "./utils.js"

const DEFINITIONS = {
  GAIN_STRENGTH: {
    name: 'gain strength',
    prob: 0.1,
  },
  HEALING: {
    name: 'healing',
    prob: 0.1,
  },
  POISON: {
    name: 'poison',
    prob: 0.4,
  }
}

export default class PotionFactory {
  static getPotion() {
    const type = randomElement(DEFINITIONS, def => def.prob)
    console.log(type)
    return new Potion(type)
  }
}