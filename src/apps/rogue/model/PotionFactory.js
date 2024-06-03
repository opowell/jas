import Potion from "./Potion.js"
import { randomElement } from "./utils.js"

const DEFINITIONS = {
  GAIN_STRENGTH: {
    name: 'gain strength',
    prob: 15,
  },
  HEALING: {
    name: 'healing',
    prob: 15,
  },
  POISON: {
    name: 'poison',
    prob: 8,
  },
  CONFUSION: {
    name: 'confusion',
    prob: 5
  },
  PARALYSIS: {
    name: 'paralysis',
    prob: 10
  },
  SEE_INVISIBLE: {
    name: 'see invisible',
    prob: 2
  },
  DETECT_MONSTERS: {
    name: 'detect monsters',
    prob: 6
  },
  DETECT_MAGIC: {
    name: 'detect magic',
    prob: 6
  },
  RAISE_LEVEL: {
    name: 'raise level',
    prob: 2
  },
  EXTRA_HEALING: {
    name: 'extra healing',
    prob: 5
  },
  HASTE_SELF: {
    name: 'haste self',
    prob: 4
  },
  RESTORE_STRENGTH: {
    name: 'restore strength',
    prob: 14
  },
  BLINDNESS: {
    name: 'blindness',
    prob: 4
  },
  QUENCH_THIRST: {
    name: 'quench thirst',
    prob: 1
  }
}

export const getPotion = () => {
  const type = randomElement(DEFINITIONS, def => def.prob)
  return new Potion(type)
}