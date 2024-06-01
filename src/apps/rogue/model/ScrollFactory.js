import Scroll from "./Scroll.js"

const TYPES = {
  GAIN_STRENGTH: 'gain strength',
  HEALING: 'healing',
  POISON: 'poison',
  GAIN_LEVEL: 'gain level',
  RESTORE_STRENGTH: 'restore strength',
  EXTRA_HEALING: 'extra healing',
  BLINDNESS: 'blindness',
  DETECT_MAGIC: 'detect magic',
  DETECT_FOOD: 'detect food',
  PARALYSIS: 'paralysis'
}

export default class ScrollFactory {
  static getScroll() {
    const x = Math.random()
    let scrollType
    if (x < 0.5) {
      scrollType = TYPES.GAIN_STRENGTH
    } else {
      scrollType = TYPES.HEALING
    }
    const scroll = new Scroll(scrollType)
    return scroll
  }
}