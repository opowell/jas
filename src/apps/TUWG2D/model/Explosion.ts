import { GameObject } from './GameObject'
import { Location } from './Location'
import { State } from './State'

export class Explosion extends GameObject {
  location: Location
  durationRemaining: number
  durationRemainingInitial: number

  constructor(id: number, location: Location, state: State) {
    super(id, state)
    this.location = location
    this.durationRemainingInitial = 2000
    this.durationRemaining = this.durationRemainingInitial
  }

  duplicate(): null | Explosion {
    if (this.durationRemaining <= 0) return null
    const copy = new Explosion(this.id, this.location.copy(), this.state)
    copy.durationRemaining = this.durationRemaining

    return copy
  }

  step(amount: number) {
    this.durationRemaining -= amount * 1000
  }
}
