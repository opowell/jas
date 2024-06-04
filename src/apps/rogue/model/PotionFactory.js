import Potion from "./Potion.js"
import { randomElement } from "./utils.js"

// 96     "amber",
// 97     "aquamarine",
// 98     "black",
// 99     "blue",
// 100     "brown",
// 101     "clear",
// 102     "crimson",
// 103     "cyan",
// 104     "ecru",
// 105     "gold",
// 106     "green",
// 107     "grey",
// 108     "magenta",
// 109     "orange",
// 110     "pink",
// 111     "plaid",
// 112     "purple",
// 113     "red",
// 114     "silver",
// 115     "tan",
// 116     "tangerine",
// 117     "topaz",
// 118     "turquoise",
// 119     "vermilion",
// 120     "violet",
// 121     "white",
// 122     "yellow"

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