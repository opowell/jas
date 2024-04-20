import { BaseOrder } from './BaseOrder'
import { Location } from './Location'

export class Order extends BaseOrder {
  copy(): Order {
    return new Order(this.destination.copy())
  }
  destination: Location

  constructor(destination: Location) {
    super()
    this.destination = destination
  }
}
