import GameObject from "./GameObject.js"
class Weapon extends GameObject {
  constructor(weaponType) {
    super()
    this.weaponType = weaponType
  }
}
export default Weapon