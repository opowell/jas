import { GameObject } from './GameObject'
import { Location } from './Location'
import { State } from './State'

export class Shot extends GameObject {
  start: Location
  end: Location
  timeLeft: number

  constructor(start: Location, end: Location, state: State) {
    super(Math.random(), state)
    this.start = start
    this.end = end
    this.timeLeft = 0.3
  }

  duplicate(state: State): Shot {
    const object = new Shot(this.start.copy(), this.end.copy(), state)
    object.id = this.id
    object.timeLeft = this.timeLeft
    return object
  }

  step(amount: number) {
    this.timeLeft -= amount
    if (this.timeLeft <= 0) {
      const index = this.state.data.objects.indexOf(this)
      if (index >= 0) this.state.data.objects.splice(index, 1)
    }
  }
}
