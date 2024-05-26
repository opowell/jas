class Location {
  constructor(stateObj) {
    this.x = stateObj.x
    this.y = stateObj.y
    this.objects = []
    this.visible = stateObj.visible
    this.seen = stateObj.seen
    this.type = stateObj.type
    this.item = stateObj.item
    this.character = stateObj.character
    this.mapped = stateObj.mapped
  }
  toJson() {
    return {
      x: this.x,
      y: this.y,
      visible: this.visible,
      seen: this.seen,
      type: this.type,
      item: this.itemToJson(),
      character: this.characterToJson(),
      mapped: this.mapped
    }
  }
  itemToJson() {
    if (!this.item) {
      return undefined
    }
    return this.item.toJson()
  }
  characterToJson() {
    if (!this.character) return undefined
    return this.character.toJson()
  }
}
export default Location