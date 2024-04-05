class Location {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.objects = []
    this.visible = false
    this.seen = false
    this.type = null
    this.item = null
    this.character = null
    this.mapped = false
  }
}
export default Location