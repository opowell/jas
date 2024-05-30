import Scroll from "./Scroll.js"

const TYPES = {
  GAIN_STRENGTH: 'gain strength',
  HEALING: 'healing'
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