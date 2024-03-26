class GameCell {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.objects = []
    this.visible = false
    this.type = null
  }
}
export default GameCell