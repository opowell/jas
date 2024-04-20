import { Game } from '../../../model/Game'
import { reactive } from 'vue'
import { Location } from './Location'
import { State } from './State'
import { Box } from './Box'
import { Unit } from './Unit'
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

export class TUWG2DGame extends Game {
  data: {
    states: State[]
    status: string
  }
  seed: number
  height: number
  width: number

  constructor(width: number, height: number) {
    super(GAME_NAME)
    this.width = width
    this.height = height
    this.data = reactive({
      states: [],
      status: 'ready',
    })
    this.seed = 19239019210
    this.addState(0)
  }

  addUnit(
    color = FORCES[FORCE_NAMES.RED].color,
    x?: number,
    y?: number,
    force = FORCE_NAMES.RED,
    orientationMove = 0
  ) {
    const curState = this.data.states[this.data.states.length - 1]
    const count = curState.data.objects.length
    if (!x) x = 50
    if (!y) y = count * 200 + 50
    const newObject = new Unit(
      count,
      new Location(x, y),
      curState,
      color,
      force,
      orientationMove
    )
    curState.data.objects.push(newObject)
  }

  addBox(x: number, y: number, size: number) {
    const curState = this.data.states[this.data.states.length - 1]
    const count = curState.data.objects.length
    const newObject = new Box(count, new Location(x, y), size, curState)
    curState.data.objects.push(newObject)
  }

  addState(index: number) {
    this.data.states.push(new State(index, this))
  }

  calcNextCollision() {
    const lastState = this.data.states[this.data.states.length - 1]
    lastState.calcNextCollision()
    if (lastState.nextCollision) {
      const nextState = lastState.step(
        math.clone(lastState.nextCollision).minus(lastState.index).done()
      )
      nextState.applyEvents(lastState.nextEvents)
      this.data.states.push(nextState)
    }
  }

  step(amount: number, curState: State) {
    const nextState = curState.step(amount)
    this.data.states.push(nextState)
  }

  calculateStatesUpTo(targetStep: number) {
    let lastState = this.data.states[this.data.states.length - 1]
    while (lastState.index < targetStep) {
      const nextState = lastState.getNextState()
      if (!nextState) {
        lastState = lastState.step(targetStep - lastState.index)
        this.data.states.push(lastState)
        break
      }
      this.data.states.push(nextState)
      lastState = this.data.states[this.data.states.length - 1]
    }
  }
}
