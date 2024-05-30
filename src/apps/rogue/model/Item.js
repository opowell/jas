import StatefulObject from "./StatefulObject.js"

class Item extends StatefulObject{
  constructor(object) {
    super({
      location: null,
      type: null,
      quantity: 1,
      ...object
    })
  }
  matchesForInventory() {
    return false
  }
}
export default Item