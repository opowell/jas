import { Location } from './Location'
import { sqrt, add, pow, atan, subtract } from 'mathjs'
export function valid(x: number) {
  return !isNaN(x) && x > 0
}

export function rootsQuadratic(A: number, B: number, C: number) {
  const B2 = pow(B, 2)
  const b2m4ac = sqrt(subtract(B2, 4 * A * C))
  const t1 = (add(-B, b2m4ac)) / (2 * A)
  const t2 = (add(-B, -b2m4ac)) / (2 * A)
  return [t1, t2]
}

export function length(p1: Location, p2: Location) {
  return sqrt(add(pow(p1.x - p2.x, 2), pow(p1.y - p2.y, 2)))
}

/**
 * Returns whether x is contained within A-B.
 * -> = 0             pi
 * / up = pi/4        3pi/4
 * | up = pi/2        pi/2
 * <- = pi            0
 * <- = -pi           2px
 * / down = -3pi / 4  7pi/4
 * | down = -pi / 2   3pi/2
 * -> = 0             pi
 */
export function angleBetweenAB(x: number, a: number, b: number) {
  x = standardizeAngle(x)
  a = standardizeAngle(a)
  b = standardizeAngle(b)
  if (a < x) {
    return x < b || b < a
  } else {
    return b > x
  }
}

function standardizeAngle(x: number) {
  return Math.PI - x
}

export function angle(p1: Location, p2: Location) {
  const dx = p1.x - p2.x
  const flip = dx < 0 ? -1 : 1
  return flip * atan((p1.y - p2.y) / dx)
}

export enum CLICK_MODES {
  MOVE,
  TARGET,
  CLEAR_SELECTION,
}

export const Z_INDEXES = {
  UNIT_SELECT_HIGHLIGHT: 30,
  SELECTED_ORDER_START_POSITION: 24,
  SELECTED_ORDER: 19,
  FOG: 18,
  EXPLOSION: 10,
  UNIT: 7,
  UNIT_TRACK: 6,
  GUN: 6,
  SHOT: 5,
  ORDER_START_POSITION: 4,
  ORDER: 3,
  BOX: 2,
  VISION: 1,
}
