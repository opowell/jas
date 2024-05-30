import Item from "./Item.js"
class Weapon extends Item {
  constructor(weaponType) {
    super({
      weaponType
    })
  }
}
export default Weapon