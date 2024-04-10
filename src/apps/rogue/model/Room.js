class Room {
  constructor(x, y, width, height) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.locations = []
    this.lit = false
  }
  setRightDoor(location) {
    this.rightDoor = location
    location.setType('door')
  }
  setLeftDoor(location) {
    this.leftDoor = location
    location.setType('door')
  }
  setUpDoor(location) {
    this.upDoor = location
    location.setType('door')
  }
  setDownDoor(location) {
    this.downDoor = location
    location.setType('door')
  }
}
export default Room