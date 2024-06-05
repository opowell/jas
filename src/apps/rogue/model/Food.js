import Item from "./Item.js"

class Food extends Item {
  constructor(foodType) {
    super({
      type: 'food',
      foodType: foodType.name,
    })
  }
  get label() {
    if (this.quantity === 1) {
      return 'a ration of food'
    }
    return this.quantity + ' rations of food'
  }
}
export default Food