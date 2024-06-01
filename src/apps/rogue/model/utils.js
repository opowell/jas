/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns a random integer from [x, y].
 */
export const randomInt = (x, y = 0) => {
  const min = Math.min(x, y)
  const dist = Math.abs(x - y)
  return Math.round(Math.random() * dist) + min
}
/**
 * 
 * @param {Array} array
 * @returns a random element from the array.
 */
export const randomElement = (array) => {
  if (array.length === 0) return
  const index = randomInt(array.length - 1)
  return array[index]
}

export const isDiagonalMove = (a, b) => {
  return Math.abs(Math.abs(a.x - b.x) - Math.abs(a.y - b.y)) === 0
}
