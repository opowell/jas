import { Explosion } from './Explosion'
import { TUWG2DGame } from './Game'
import { GameEvent } from './GameEvent'
import { GameObject } from './GameObject'
import { Location } from './Location'
import { Shot } from './Shot'
import { Unit } from './Unit'
import { rootsQuadratic, valid } from './utils'
import { add, bignumber } from 'mathjs'

export class State {
  data: {
    autoTarget: boolean
    objects: GameObject[]
  }
  game: TUWG2DGame
  index: number
  nextCollision: number | undefined
  nextEvents: GameEvent[]

  constructor(index: number, game: TUWG2DGame) {
    this.index = index
    this.data = {
      autoTarget: true,
      objects: [],
    }
    this.nextEvents = []
    this.game = game
  }

  addExplosion(location: Location) {
    this.data.objects.push(
      new Explosion(this.data.objects.length, location, this)
    )
  }
  addShotFromPoints(p1: Location, p2: Location, angle2: number, unit: Unit) {
    const dx = p2.x - p1.x
    const sin = Math.sin(angle2)
    const cos = Math.cos(angle2)

    // Method 1: Same distance as target.
    // const dh = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    // const potentialDistances = [dh]

    // Method 2: Max. distance = infinity -> newP2 = closest intersection with another game object.
    const w = this.game.width
    const h = this.game.height
    const flipX = dx < 0 ? -1 : 1
    const flipY = dx < 0 ? -1 : 1
    const dh1 = (flipX * (0 - p1.x)) / cos // x = 0
    const dh2 = (flipX * (w - p1.x)) / cos // x = w
    const dh3 = (flipY * (0 - p1.y)) / sin // y = 0
    const dh4 = (flipY * (h - p1.y)) / sin // y = h
    const potentialDistances = [dh1, dh2, dh3, dh4]
    /////////////////////

    let closestHitDistance = Infinity
    for (const i in potentialDistances) {
      const d = potentialDistances[i]
      if (d >= 0 && d < closestHitDistance) closestHitDistance = d
    }

    let intersection

    const unitIntersections = []
    for (let i = 0; i < this.data.objects.length; i++) {
      const object = this.data.objects[i]
      if (object === unit) continue
      switch (object.constructor.name) {
        case 'Unit':
          intersection = (object as Unit).shotDistance(p1, angle2)
          if (intersection) unitIntersections.push(intersection)
          break
        case 'Box':
          // console.log('box', object)
          break
      }
    }

    let y2 = flipY * sin * closestHitDistance + p1.y
    let x2 = flipX * cos * closestHitDistance + p1.x

    let unitHit
    for (const i in unitIntersections) {
      const d = unitIntersections[i]
      if (d.distance < closestHitDistance) {
        closestHitDistance = d.distance
        unitHit = d.unit
        x2 = d.intersectX
        y2 = d.intersectY
      }
    }

    const newP2 = new Location(x2, y2)

    if (unitHit) {
      unitHit.takeHit()
      this.addExplosion(newP2)
    }

    this.addShot(new Shot(p1, newP2, this))
  }
  applyEvents(nextEvents: GameEvent[]) {
    for (let i = 0; i < nextEvents.length; i++) {
      const event = nextEvents[i]
      const obj1 = this.data.objects[event.entities[0]]
      const obj2 = this.data.objects[event.entities[1]]
      obj1.applyEvent(obj2)
      obj2.applyEvent(obj1)
    }
  }
  calcNextCollision() {
    let timeNextEvents = Infinity

    // const nextExogEvent = this.getNextExogEvent()
    // if (nextExogEvent != null) {
    //   nextEvents = [nextExogEvent]
    //   timeNextEvents = nextExogEvent.time
    // }

    const entities = this.data.objects

    // Collisions between objects.
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const timeChange = this.timeCollision(entities[i], entities[j])
        if (timeChange) {
          if (timeChange < timeNextEvents) {
            this.nextEvents = []
            timeNextEvents = timeChange
          }
          if (timeChange <= timeNextEvents) {
            this.nextEvents.push(new GameEvent('collision', [i, j]))
          }
        }
      }
    }

    // Change in unit orders.
    for (let i = 0; i < entities.length; i++) {
      const entity = entities[i]
      const nextEvents = entity.getNextEvents()
      if (nextEvents.timeChange < timeNextEvents) {
        this.nextEvents = []
        timeNextEvents = nextEvents.timeChange
      }
      if (nextEvents.timeChange <= timeNextEvents) {
        this.nextEvents.push(...nextEvents.events)
      }
  }

    this.nextCollision = timeNextEvents
    // this.setStateTime(copyOfPrevState, timeNextEvents)
    // this.applyEvents(copyOfPrevState, nextEvents)
  }

  distanceBetween(pos1: Location, pos2: Location) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    )
  }

  getNextExogEvent() {
    return null
  }

  timeCollision(ent1: GameObject, ent2: GameObject) {
    const dx = ent1.data.position.x - ent2.data.position.x
    const dy = ent1.data.position.y - ent2.data.position.y
    const dx2 = Math.pow(dx, 2)
    const dy2 = Math.pow(dy, 2)
    const dvx = ent1.velocity.value.x - ent2.velocity.value.x
    const dvy = ent1.velocity.value.y - ent2.velocity.value.y
    const dvx2 = Math.pow(dvx, 2)
    const dvy2 = Math.pow(dvy, 2)
    const s1 = ent1.data.size
    const s2 = ent2.data.size
    const A = dvx2 + dvy2
    const B = 2 * dx * dvx + dy * dvy
    const C = dx2 + dy2 - Math.pow(s1 + s2, 2)
    const [t1, t2] = rootsQuadratic(A, B, C)
    if (valid(t1) && !valid(t2)) return t1
    if (!valid(t1) && valid(t2)) return t2
    if (!valid(t1) && !valid(t2)) return
    return t1 < t2 ? t1 : t2
  }

  step(amount: number) {
    const nextState = new State(add(bignumber(this.index), bignumber(amount)), this.game)
    this.data.objects.forEach((object) => {
      const duplicate = object.duplicate(nextState)
      if (duplicate) nextState.data.objects.push(duplicate)
    })
    nextState.data.autoTarget = this.data.autoTarget
    nextState.data.objects.forEach((object) => object.step(amount))
    return nextState
  }

  addShot(shot: Shot) {
    const count = this.data.objects.length
    shot.id = count
    this.data.objects.push(shot)
  }

  getNextState(): State | undefined {
    let amount = Infinity
    this.data.objects.forEach((object) => {
      const timeOfNextStateChange = object.getTimeOfNextStateChange()
      if (timeOfNextStateChange && timeOfNextStateChange < amount) {
        amount = timeOfNextStateChange
      }
    })
    if (amount === Infinity) return
    return this.step(amount)
  }
}
