import { TUWG2DGame } from '@/games/TUWG2D/model/Game'
import { defineStore } from 'pinia'
import { State } from '../../../model/State'

interface StoreState {
  selectedObjectId: string | undefined
  curStep: number
  game: TUWG2DGame | undefined
  stepIncrement: number
  playbackSpeed: number
}

export const useStore = defineStore('main', {
  state: (): StoreState => {
    return {
      selectedObjectId: undefined,
      curStep: 0,
      game: undefined,
      stepIncrement: 100,
      playbackSpeed: 20
    }
  },
  getters: {
    selectedObject() {
      if (!this.selectedObjectId) return null
      if (this.curState === undefined) return null

      const objects = this.curState.data.objects
      for (let i = 0; i < objects.length; i++) {
        if (objects[i].id === this.selectedObjectId) return objects[i]
      }

      return null
    },
    curState: (state): State => {
      const states = state.game?.data.states
      let lastStateWithLowerIndex = undefined
      let insertIndex = undefined
      if (!states) return
      for (let i = 0; i < states.length; i++) {
        const gameState = states[i]
        const diff = gameState.index - state.curStep
        if (diff === 0) return gameState
        if (diff < 0) lastStateWithLowerIndex = gameState
        if (diff > 0) {
          insertIndex = i
          break
        }
      }
      if (lastStateWithLowerIndex) {
        const nextState = lastStateWithLowerIndex.step(
          state.curStep - lastStateWithLowerIndex.index
        )
        if (insertIndex) states?.splice(insertIndex, 0, nextState)
        else states?.push(nextState)

        return nextState
      }
      return null
    },
  },
})
