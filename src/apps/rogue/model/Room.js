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
    location.type = 'door'
  }
  setLeftDoor(location) {
    this.leftDoor = location
    location.type = 'door'
  }
  setUpDoor(location) {
    this.upDoor = location
    location.type = 'door'
  }
  setDownDoor(location) {
    this.downDoor = location
    location.type = 'door'
  }
}
export default Room