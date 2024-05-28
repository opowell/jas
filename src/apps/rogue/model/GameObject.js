const { reactive } = Vue

class GameObject {
  constructor() {
    this.state = reactive({
      location: null,
      type: null
    })
  }
  set type(type) {
    this.state.type = type
  }
  set location(location) {
    this.state.location = location
  }
  get location() {
    return this.state.location
  }
  get type() {
    return this.state.type
  }
}
export default GameObject