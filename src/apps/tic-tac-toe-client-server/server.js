onMessage = function (payload) {
  if (!!winner.value) return
  if (game.value[i][j] !== '') return
  game.value[i][j] = curPlayerX.value ? 'X' : 'O'
  curPlayerX.value = !curPlayerX.value
}