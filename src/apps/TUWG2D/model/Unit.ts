import { computed, ComputedRef, reactive } from 'vue'
import { BaseOrder } from './BaseOrder'
import { Color } from './Color'
import { EventsResponse, GameObject } from './GameObject'
import { Location } from './Location'
import { Order } from './Order'
import { State } from './State'
import { TargetOrder } from './TargetOrder'
import { length, angle, angleBetweenAB } from './utils'

type Data = {
  orders: BaseOrder[]
  selectedOrders: Order[]
  size: number
  position: Location
  speed: number
  colour: Color
  target: Location | undefined
  shotDelay: number
  health: number
  vision: number
  force: string
  orientationGun: number
  orientationMove: number
  tookHit: boolean
  gunRotateSpeed: number
  moveRotateSpeed: number
  angleOfView: number
}

export class Unit extends GameObject {

  data: Data
  destination: ComputedRef<Location>
  velocity: ComputedRef<Location>

  constructor(
    id: number,
    position: Location,
    state: State,
    colour: Color,
    force: string,
    orientationMove: number
  ) {
    super(id, state)
    this.data = reactive({
      orders: [],
      selectedOrders: [],
      position,
      size: 20,
      angleOfView: 100,
      gunRotateSpeed: 0.05,
      moveRotateSpeed: 0.1,
      speed: 10,
      shotDelay: 0,
      colour,
      target: undefined,
      health: 10,
      vision: 250,
      force,
      orientationGun: 0,
      orientationMove,
      tookHit: false,
    })

    this.resetShotDelay()

    this.destination = computed(() => {
      if (this.data.orders.length === 0) return this.data.position
      let nextOrder = null
      let i = 0
      while (nextOrder === null && i < this.data.orders.length) {
        if (this.data.orders[i].constructor.name === 'Order') {
          nextOrder = this.data.orders[i]
        }
        i++
      }

      if (nextOrder === null) return new Location(0, 0)

      return (nextOrder as Order).destination
    })

    this.velocity = computed(() => {
      const destination = this.destination.value
      if (!destination) return this.data.position
      const DX = destination.x - this.data.position.x
      const DY = destination.y - this.data.position.y
      const d = this.data.speed
      const DYDX = DY / DX
      const dx = ((DX < 0 ? -1 : 1) * d) / Math.sqrt(1 + Math.pow(DYDX, 2))
      const dy = DYDX * dx
      return new Location(dx, dy)
    })
  }

  addOrder(destination: Location) {
    this.data.orders.push(new Order(destination))
  }

  addSelectedOrder(order: Order) {
    this.data.selectedOrders.push(order)
  }

  addTargetOrder(location: Location) {
    this.data.orders.push(new TargetOrder(location))
  }

  applyEvent(otherObj: GameObject) {
    if (!this.data.orders.length) return
    this.data.orders[0].destination.x -= 2 * this.velocity.value.x
    this.data.orders[0].destination.y -= 2 * this.velocity.value.y
  }

  cancelTarget() {
    this.data.target = undefined
  }

  canSee(object: GameObject) {
    switch (object.constructor.name) {
      case 'Unit': {
        const unit = object as Unit
        if (length(unit.data.position, this.data.position) > this.data.vision)
          return false
        const angleOfView = (this.data.angleOfView / 180) * Math.PI
        const theta = this.data.orientationMove + this.data.orientationGun
        const a = angleOfView / 2
        const ang = angle(unit.data.position, this.data.position)
        const start = ang < 0 ? theta - a : theta + a
        const end = ang < 0 ? theta + a : theta - a
        if (angleBetweenAB(ang, start, end)) return true
        return false
      }
    }
    return false
  }

  clickBoard(location: Location) {
    this.addOrder(location)
  }

  copy(state: State): Unit {
    return this.duplicate(state)
  }

  duplicate(state: State): Unit {
    const object = new Unit(
      this.id,
      this.data.position.copy(),
      state,
      this.data.colour,
      this.data.force,
      this.data.orientationMove
    )
    for (let i = 0; i < this.data.orders.length; i++) {
      object.data.orders.push(this.data.orders[i].copy())
    }
    object.data.size = this.data.size
    object.data.shotDelay = this.data.shotDelay
    object.data.health = this.data.health
    object.data.orientationGun = this.data.orientationGun
    if (this.data.target) object.data.target = this.data.target.copy()
    object.data.speed = this.data.speed
    return object
  }

  getGunMoveDistance() {
    const target = this.getTarget()
    const curOrient = this.data.orientationGun
    let facingTarget = true
    let targetOrient = -1
    if (target) {
      const DX = target.x - this.data.position.x
      const DY = target.y - this.data.position.y
      targetOrient = Math.atan(DY / DX) - this.data.orientationMove
      facingTarget = Math.abs(curOrient - targetOrient) < 0.0000001
    }
    let distCL
    if (curOrient > 0) {
      if (targetOrient > 0) {
        if (curOrient > targetOrient) {
          distCL = 2 * Math.PI - (targetOrient - curOrient)
        } else {
          distCL = targetOrient - curOrient
        }
      } else {
        distCL = Math.PI - curOrient + Math.PI + targetOrient
      }
    } else {
      if (targetOrient > 0) {
        distCL = targetOrient - curOrient
      } else {
        if (curOrient < targetOrient) {
          distCL = targetOrient - curOrient
        } else {
          distCL = 2 * Math.PI - (targetOrient - curOrient)
        }
      }
    }
    const distCC = 2 * Math.PI - distCL
    const CL = Math.abs(distCL) < Math.abs(distCC)
    const dist = CL ? Math.abs(distCL) : Math.abs(distCC)
    return { dist, CL, facingTarget, curOrient, targetOrient, target }
  }

  getNextEvents(): EventsResponse {
    /**
     * Potential events:
     * - fire shot
     * - change shot target
     * - change move target
     */ 
    const timeNextEvent = Infinity
    const nextEvents = []
    
    return {
      events: [],
      timeChange: Infinity
    }
  }

  getTarget() {
    let target = this.data.target
    if (this.state.data.autoTarget && !target) {
      for (let i = 0; i < this.state.data.objects.length; i++) {
        const object = this.state.data.objects[i]
        if (
          object.constructor.name === 'Unit' &&
          (object as Unit).data.force !== this.data.force &&
          this.canSee(object)
        ) {
          target = (object as Unit).data.position
          break
        }
      }
    }
    return target
  }

  getTimeOfNextStateChange(): number {
    const { dist, facingTarget } = this.getGunMoveDistance()
    if (facingTarget) return this.data.shotDelay
    else return dist / this.data.gunRotateSpeed + this.data.shotDelay
  }

  popOrder() {
    this.data.orders.pop()
  }

  resetShotDelay() {
    this.data.shotDelay = 3 + Math.random() * 4
  }

  shotDistance(start: Location, angle: number) {
    const m = Math.sin(angle) / Math.cos(angle)
    const bb = start.y - m * start.x

    const x1 = start.x - this.data.position.x
    const x2 = x1 + 1
    const y1 = start.y - this.data.position.y
    const y2 = y1 + m
    const dx = x2 - x1
    const dy = y2 - y1
    const dr = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    const D = x1 * y2 - x2 * y1
    const r = this.data.size / 2
    const DELTA = Math.pow(r, 2) + Math.pow(dr, 2) - Math.pow(D, 2)
    if (DELTA < 0) return null
    const sgnDy = dy < 0 ? -1 : 1

    const xA =
      (D * dy + sgnDy * dx * Math.sqrt(DELTA)) / Math.pow(dr, 2) +
      this.data.position.x
    const xB =
      (D * dy - sgnDy * dx * Math.sqrt(DELTA)) / Math.pow(dr, 2) +
      this.data.position.x
    const yA =
      (-D * dx + Math.abs(dy) * Math.sqrt(DELTA)) / Math.pow(dr, 2) +
      this.data.position.y
    const yB =
      (-D * dx - Math.abs(dy) * Math.sqrt(DELTA)) / Math.pow(dr, 2) +
      this.data.position.y

    const pAA = new Location(xA, yA)
    const pAB = new Location(xA, yB)
    const pBA = new Location(xB, yA)
    const pBB = new Location(xB, yB)

    const potentialPoints = [pAA, pAB, pBA, pBB]
    let point = null
    let distance = Infinity
    for (let i = 0; i < potentialPoints.length; i++) {
      const potentialPoint = potentialPoints[i]
      if (length(start, potentialPoint) < distance) {
        point = potentialPoint
        distance = length(start, potentialPoint)
      }
    }
    if (!point) return null
    const intersectX = point.x
    const intersectY = point.y

    // const a = -m
    // const b = 1
    // const c = -bb
    // const x0 = this.data.position.x
    // const y0 = this.data.position.y

    // const a2b2 = Math.pow(a, 2) + Math.pow(b, 2)
    // const distanceToShot = Math.abs(a * x0 + b * y0 + c) / Math.sqrt(a2b2)

    // if (distanceToShot > this.data.size / 2) return null

    // const intersectX = (b * (b * x0 - a * y0) - a * c) / a2b2
    // const intersectY = (a * (-b * x0 + a * y0) - b * c) / a2b2

    // const dx2 = Math.pow(start.x - intersectX, 2)
    // const dy2 = Math.pow(start.y - intersectY, 2)
    // const distance = Math.sqrt(dx2 + dy2)
    return {
      distance,
      intersectX,
      intersectY,
      unit: this,
    }
  }

  step(amount: number) {
    let gunAmount = amount
    if (this.data.health <= 0) return
    let finishedMove = false

    while (!finishedMove && this.data.orders.length) {
      const order = this.data.orders[0]
      switch (order.constructor.name) {
        case 'Order': {
          const curOrient = this.data.orientationMove
          const DX = order.destination.x - this.data.position.x
          const DY = order.destination.y - this.data.position.y
          let targetOrient = Math.atan(DY / DX)
          if (DX < 0 && DY > 0) {
            targetOrient = Math.PI + targetOrient
          }
          if (DX < 0 && DY < 0) {
            targetOrient = targetOrient - Math.PI
          }
          let distCL
          if (curOrient > 0) {
            if (targetOrient > 0) {
              if (curOrient > targetOrient) {
                distCL = 2 * Math.PI - (targetOrient - curOrient)
              } else {
                distCL = targetOrient - curOrient
              }
            } else {
              distCL = Math.PI - curOrient + Math.PI + targetOrient
            }
          } else {
            if (targetOrient > 0) {
              distCL = targetOrient - curOrient
            } else {
              if (curOrient < targetOrient) {
                distCL = targetOrient - curOrient
              } else {
                distCL = 2 * Math.PI - (targetOrient - curOrient)
              }
            }
          }
          const distCC = 2 * Math.PI - distCL
          const CL = Math.abs(distCL) < Math.abs(distCC)
          const dist = CL ? Math.abs(distCL) : Math.abs(distCC)
          if (curOrient !== targetOrient) {
            if (dist >= amount * this.data.moveRotateSpeed) {
              if (CL) {
                this.data.orientationMove += amount * this.data.moveRotateSpeed
                if (this.data.orientationMove > Math.PI) {
                  const x = this.data.orientationMove
                  this.data.orientationMove =
                    this.data.orientationMove - 2 * Math.PI
                }
              } else {
                this.data.orientationMove -= amount * this.data.moveRotateSpeed
                if (this.data.orientationMove < -Math.PI) {
                  const x = this.data.orientationMove
                  this.data.orientationMove =
                    2 * Math.PI + this.data.orientationMove
                }
              }
              return
            } else {
              this.data.orientationMove = targetOrient
              amount -= dist / this.data.moveRotateSpeed
            }
          }
          let d = amount * this.data.speed
          const toMove = d
          const D = Math.sqrt(Math.pow(DX, 2) + Math.pow(DY, 2))
          if (d >= D) {
            d = D
            this.data.orders.shift()
          }
          amount = amount * (1 - D / toMove)
          if (amount <= 0) finishedMove = true
          const DYDX = DY / DX
          const dx = ((DX < 0 ? -1 : 1) * d) / Math.sqrt(1 + Math.pow(DYDX, 2))
          const dy = DYDX * dx
          this.data.position.x += dx
          this.data.position.y += dy
          break
        }
        case 'TargetOrder': {
          const target = (order as TargetOrder).target
          this.data.target = target.copy(this.state)
          this.data.orders.shift()
          break
        }
      }
    }

    let { dist, CL, facingTarget, curOrient, targetOrient, target } =
      this.getGunMoveDistance()
    while (gunAmount > 0 && !facingTarget) {
      if (curOrient !== targetOrient) {
        if (dist >= gunAmount * this.data.gunRotateSpeed) {
          if (CL) {
            this.data.orientationGun += gunAmount * this.data.gunRotateSpeed
            if (this.data.orientationGun > Math.PI) {
              this.data.orientationMove = this.data.orientationGun - 2 * Math.PI
            }
          } else {
            this.data.orientationGun -= gunAmount * this.data.gunRotateSpeed
            if (this.data.orientationGun < -Math.PI) {
              this.data.orientationGun = 2 * Math.PI + this.data.orientationGun
            }
          }
          gunAmount = 0
        } else {
          this.data.orientationGun = targetOrient
          gunAmount -= dist / this.data.gunRotateSpeed
          facingTarget = true
        }
      }
    }

    this.data.shotDelay -= gunAmount
    if (!target) {
      this.data.shotDelay = Math.max(this.data.shotDelay, 0)
    } else {
      if (this.data.shotDelay <= 0) {
        const leftover = this.data.shotDelay
        this.resetShotDelay()
        this.data.shotDelay += leftover
        const p1 = this.data.position
        const p2 = target
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const angle = Math.atan(dy / dx)
        const angle2 = angle + (Math.random() - 0.5) / 10
        this.state.addShotFromPoints(p1, p2, angle2, this)
      }
    }
  }

  takeHit() {
    this.data.health--
    this.data.tookHit = true
  }
}
