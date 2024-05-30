import StatefulObject from "./StatefulObject.js"

const { computed } = Vue
class Location extends StatefulObject{
  constructor(x, y) {
    super({
      x,
      y,
      objects: [],
      visible: false,
      seen: false,
      type: null,
      item: null,
      character: null,
      mapped: false,
      room: null
    })
    this.isFloor = computed(() => {
      return this.type === 'floor'
    })
    this.canPlacePlayer = computed(() => {
      return !this.character && this.isFloor.value && !this.item
    })
    this.isHallway = computed(() => {
      return this.type === 'hallway'
    })
    this.canPlaceItem = computed(() => {
      if (!this.isFloor.value && !this.isHallway.value) return false
      if (!!this.item) return false
      return true
    })
    this.canPlaceStairs = computed(() => {
      if (!this.isFloor.value) return false
      if (!!this.item) return false
      return true
    })
  }
  reset() {
    this.objects = []
    this.visible = false
    this.seen = false
    this.type = null
    this.item = null
    this.character = null
    this.mapped = false
    this.room = null
  }
}
export default Location