import { TUWG2DGame } from './Game'
import { Color } from './Color'
import { create, all } from 'mathjs'

const math = create(all, {})

const FORCE_NAMES = {
  BLUE: 'blue',
  RED: 'red'
}
const FORCES = {
  [FORCE_NAMES.BLUE]: {
    color: new Color(0, 0, 255)
  },
  [FORCE_NAMES.RED]: {
    color: new Color(255, 0, 0)
  }
}
const GAME_NAME = 'TUWG2D'

export class GameFactory {
  static createSimpleGame() {
    const game = new TUWG2DGame(500, 500)
    game.seed = 19239019210

    game.addUnit()
    game.addUnit(FORCES[FORCE_NAMES.BLUE].color, 400, 100, FORCE_NAMES.BLUE, Math.PI)
    return game
  }
  static createNormalGame() {
    const game = new TUWG2DGame(1000, 800)
    game.addUnit()
    game.addUnit()
    game.addUnit()

    game.addUnit(FORCES[FORCE_NAMES.BLUE].color, 800 - 100, 100, FORCE_NAMES.BLUE, Math.PI)
    game.addUnit(FORCES[FORCE_NAMES.BLUE].color, 800 - 100, 300, FORCE_NAMES.BLUE, Math.PI)
    game.addUnit(FORCES[FORCE_NAMES.BLUE].color, 800 - 100, 500, FORCE_NAMES.BLUE, Math.PI)

    game.addBox(150, 150, 100)
    game.addBox(550, 200, 200)
    return game
  }
}
