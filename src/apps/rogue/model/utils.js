/**
 * 
 * @param {number} x 
 * @param {number} y 
 * @returns a random integer from [x, y].
 */
export const randomInt = (x, y = 0, weights) => {
    console.log('randomInt', x, y, weights)
    const cumWeights = []
    let sum = 0
    const dist = Math.abs(x - y)
    for (let i = 0; i < dist; i++) {
        sum += weights ? weights[i] : 1
        cumWeights[i] = sum
    }
    const draw = Math.round(Math.random() * sum)
    let curSum = 0
    let index = 0
    for (let i = 0; i < cumWeights.length; i++) {
        curSum += cumWeights[i]
        if (curSum > draw) {
            break
        }
        index++
    }
    const min = Math.min(x, y)
    return min + index
}
/**
 * 
 * @param {Array} array
 * @returns a random element from the array.
 */
export const randomElement = (array, weightFn = x => x) => {
  if (array.length === 0) return
  const keys = Object.keys(array)
    const index = randomInt(keys.length - 1, 0, keys.map(key => array[key]).map(item => weightFn(item)))
  console.log('randomElement', index, array, weightFn)
    return array[keys[index]]
}

export const isDiagonalMove = (a, b) => {
  return Math.abs(Math.abs(a.x - b.x) - Math.abs(a.y - b.y)) === 0
}
