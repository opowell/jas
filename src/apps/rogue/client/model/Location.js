const { computed, reactive, ref } = Vue
class Location {
  constructor(x, y) {
    this.state = reactive({
      x,
      y,
      objects: [],
      visible: false,
      seen: false,
      type: null,
      item: null,
      character: null,
      mapped: false
    })
    this.isFloor = computed(() => {
      return this.state.type === 'floor'
    })
    this.isHallway = computed(() => {
      return this.state.type === 'hallway'
    })
    this.canPlaceItem = computed(() => {
      if (!this.isFloor.value && !this.isHallway.value) return false
      if (!!this.state.item) return false
      return true
    })
  }
  get x() {
    return this.state.x
  }
  get y() {
    return this.state.y
  }
  get type() {
    return this.state.type
  }
  get item() {
    return this.state.item
  }
  set item(item) {
    this.state.item = item
  }
  setType(type) {
    this.state.type = type
  }
  setItem(item) {
    this.state.item = item
  }
  reset() {
    this.state.objects = []
    this.state.visible = false
    this.state.seen = false
    this.state.type = null
    this.state.item = null
    this.state.character = null
    this.state.mapped = false
  }
}
export default Location