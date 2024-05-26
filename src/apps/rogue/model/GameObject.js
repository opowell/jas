class GameObject {
  constructor() {
    this.location = null
    this.type = null
  }
  toJson() {
    return {
      type: this.type
    }
  }
}
export default GameObject