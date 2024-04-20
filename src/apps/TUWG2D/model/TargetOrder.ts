import { BaseOrder } from './BaseOrder'
import { Location } from './Location'
import { Unit } from './Unit'

export class TargetOrder extends BaseOrder {
  copy(): TargetOrder {
    return new TargetOrder(this.target.copy())
  }
  target: Location | Unit

  constructor(target: Location | Unit) {
    super()
    this.target = target
  }
}
