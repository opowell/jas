import { reactive } from 'vue'
import { GameObject } from './GameObject'
import { Location } from './Location'
import { State } from './State'

type Data = {
  size: number
  position: Location
}

export class Box extends GameObject {
  data: Data

  constructor(id: number, position: Location, size: number, state: State) {
    super(id, state)
    this.data = reactive({
      position,
      size,
    })
  }

  duplicate(state: State): Box {
    const object = new Box(
      this.id,
      this.data.position.copy(),
      this.data.size,
      state
    )
    object.data.size = this.data.size
    return object
  }
}
