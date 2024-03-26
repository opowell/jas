window.jap = {}
window.jap.init = () => {
  const { computed, createApp, ref } = Vue
  createApp({
    setup() {
      // STATE
      const curPlayerX = ref(null)
      const game = ref()
      // COMPUTED
      const lines = computed(() => {
        const out = []
        for (let i=0; i<3; i++) {
          out.push([[i,0], [i,1], [i,2]]) // rows
          out.push([[0,i], [1,i], [2,i]]) // columns
        }
        out.push([[0,0], [1,1], [2,2]]) // diagonal TL-BR
        out.push([[2,0], [1,1], [0,2]]) // diagonal BL-TR
        return out
      })
      const winningLine = computed(() => {
        const gameValue = game.value
        return lines.value.find(line => {
          const firstSpace = gameValue[line[0][0]][line[0][1]]
          return firstSpace !== '' && line.every(space => gameValue[space[0]][space[1]] === firstSpace)
        })
      })
      const winner = computed(() => {
        const v = winningLine.value
        if (!v) return
        return game.value[v[0][0]][v[0][1]]
      })
      // METHODS
      const handleClick = (i,j) => {
        if (!!winner.value) return
        if (game.value[i][j] !== '') return
        game.value[i][j] = curPlayerX.value ? 'X' : 'O'
        curPlayerX.value = !curPlayerX.value
      }
      const startNewGame = () => {
        game.value = [
          ['','',''],
          ['','',''],
          ['','','']
        ]
        curPlayerX.value = true
      }
      const getSpaceClasses = (space, i, j) => {
        return { used: space !== '', finished: !!winningLine.value, winner: isWinningSpace(i, j) }
      }
      const isWinningSpace = (i, j) => {
        if (!winningLine.value) return false
        return !!winningLine.value.find((space => space[0] === i && space[1] === j))
      }
      // MOUNTED
      startNewGame()
      const out = {
        game,
        winningLine,
        getSpaceClasses,
        handleClick,
        startNewGame,
        winner
      }
      Object.keys(out).forEach(key => {
        window.jap[key] = out[key]
      })
      return out
    }
  }).mount('#app')
}
