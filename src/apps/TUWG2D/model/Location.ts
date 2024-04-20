export class Location {
  x: number
  y: number

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  copy(): Location {
    return new Location(this.x, this.y)
  }

}
