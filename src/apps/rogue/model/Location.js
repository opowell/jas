class Location {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.objects = []
    this.visible = false
    this.type = null
    this.item = null
    this.character = null
  }
}
export default Location