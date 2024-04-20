import { GameEvent } from './GameEvent'
import { State } from './State'

export type EventsResponse = {
  events: GameEvent[]
  timeChange: number
}

export class GameObject {
  getNextEvents(): EventsResponse {
    return {
      events: [],
      timeChange: Infinity
    }
  }
  state: State
  id: number

  constructor(id: number, state: State) {
    this.state = state
    this.id = id
  }
  duplicate(state: State): GameObject | null {
    const object = new GameObject(this.id, state)
    return object
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  step(amount: number) { }
  
  getTimeOfNextStateChange(): number {
    return Infinity
  }
}
