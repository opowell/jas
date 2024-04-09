const { computed, ref } = Vue
class Location {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.objects = []
    this.visible = false
    this.seen = false
    this.type = ref(null)
    this.item = ref(null)
    this.character = null
    this.mapped = false
    this.isFloor = computed(() => {
      return this.type.value === 'floor'
    })
    this.isHallway = computed(() => {
      return this.type.value === 'hallway'
    })
    this.canPlaceItem = computed(() => {
      if (!this.isFloor.value && !this.isHallway.value) return false
      if (!!this.item.value) return false
      return true
    })
  }
  setType(type) {
    this.type.value = type
  }
  setItem(item) {
    this.item.value = item
  }
}
export default Location