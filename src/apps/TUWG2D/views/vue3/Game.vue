<script setup lang="ts">
  import { TUWG2DGame } from '@/games/TUWG2D/model/Game'
  import { computed, onMounted, Ref, ref } from 'vue'
  import { CLICK_MODES } from './utils'
  import { Unit } from '../../model/Unit'
  import { State } from '../../model/State'
  import { GameObject } from '../../model/GameObject'

  import GameControls from './App/Game/Controls/GameControls.vue'
  import StateVue from './App/Game/State/State.vue'
  import ViewBox from './App/Game/ViewBox'

  import { useStore } from './store/pinia'
  import { bignumber, create, all } from 'mathjs'
  import { storeToRefs } from 'pinia'

  const math = create(all, {})

  const store = useStore()
  const { stepIncrement, playbackSpeed } = storeToRefs(store)

  const selectedObjectId = ref(-1)

  const selectedObject = computed(() => {
    if (selectedObjectId.value === -1) return null
    if (!curState.value) return null

    const objects = curState.value.data.objects
    for (let i = 0; i < objects.length; i++) {
      if (objects[i].id === selectedObjectId.value) return objects[i]
    }

    return null
  })

  const viewBox = ref({
    top: 0,
    left: 0,
    width: 0,
    height: 0
  })

  function setSelectedObjectId(id: number) {
    selectedObjectId.value = id
    if (id) setClickMode(CLICK_MODES.CLEAR_SELECTION)
  }

  const selectedUnit = computed(() => {
    if (!selectedObject.value) return undefined
    return selectedObject.value as Unit
  })

  const props = defineProps<{ game: TUWG2DGame }>()

  const curStep = ref(0)
  const playing = ref(false)
  const stepSize = ref(bignumber(0.2))
  const mousePositionX = ref(null)
  const mousePositionY = ref(null)
  const selectedForce = ref('red')
  const stateVue = ref(null)
  const autoTarget = ref(true)

  function setClickMode(mode: number) {
    if (!stateVue.value) return
    stateVue.value.setClickMode(mode)
  }

  function addUnit() {
    props.game.addUnit()
  }
  function calcNextCollision() {
    props.game.calcNextCollision()
  }

  let incrementInterval: number | undefined
  function incrStep() {
    const requestedSteps = []
    props.game.data.status = 'calculating'
    let curStepIndex = curStep.value
    for (let i = 0; i < stepIncrement.value; i++) {
      requestedSteps.push(curStepIndex)
      curStepIndex = math.chain(stepSize.value).add(curStepIndex).done()
    }
    props.game.calculateStatesUpTo(curStepIndex)
    props.game.data.status = 'playing'
    playing.value = true
    let steps = 0
    let delay = 1000 / playbackSpeed.value
    incrementInterval = setInterval(function () {
      curStep.value = math.chain(stepSize.value).add(curStep.value).done()
      steps++
      if (steps >= stepIncrement.value) {
        stopPlay()
      }
    }, delay)
  }

  function stopPlay() {
    clearInterval(incrementInterval)
    playing.value = false
    props.game.data.status = 'ready'
  }

  function handleKeypressEscape() {
    console.log('escape')
    toggleOverlay()
    if (stateVue.value.clickMode !== CLICK_MODES.CLEAR_SELECTION) {
      setClickMode(CLICK_MODES.CLEAR_SELECTION)
      return
    }
    console.log('show overlay')
  }

  function toggleOverlay() {
    console.log('toggle')
  }

  const selectingUnit = ref(false)

  function unitSelect() {
    console.log('select unit')
    selectingUnit.value = !selectingUnit.value
  }

  function deleteKeyPress() {
    stateVue.value?.deleteLastOrder()
  }

  function jumpToPresent() {
    curStep.value = lastState.value.index
  }

  function cancelTarget() {
    if (selectedObject.value) {
      ;(selectedObject.value as Unit).cancelTarget()
    }
  }

  function setGameSeed(seed: number) {
    console.log('seed', seed)
  }

  const curState = computed((): State | null => {
    const states = props.game.data.states
    let lastStateWithLowerIndex = undefined
    let insertIndex = undefined
    for (let i = 0; i < states.length; i++) {
      const state = states[i]
      const diff = state.index - curStep.value
      if (diff === 0) return state
      if (diff < 0) lastStateWithLowerIndex = state
      if (diff > 0) {
        insertIndex = i
        break
      }
    }
    if (lastStateWithLowerIndex) {
      const val1 = bignumber(curStep.value)
      const val2 = bignumber(lastStateWithLowerIndex.index)
      const nextState = lastStateWithLowerIndex.step(
        math.chain(val1).subtract(val2).done()
      )
      if (insertIndex) states.splice(insertIndex, 0, nextState)
      else states.push(nextState)

      return nextState
    }
    return null
  })

  const lastState = computed(() => {
    return props.game.data.states[props.game.data.states.length - 1]
  })

  onMounted(() => {
    if (stateVue.value) {
      viewBox.value.width = stateVue.value.clientWidth
      viewBox.value.height = stateVue.value.clientHeight      
      console.log('set', stateVue.value.clientWidth, viewBox.value.width)
    }
  })

</script>

<template>
  <div
    class="container"
    tabindex="0"
    @keyup.m="setClickMode(CLICK_MODES.MOVE)"
    @keyup.t="setClickMode(CLICK_MODES.TARGET)"
    @keyup.esc="handleKeypressEscape"
    @keyup.u="unitSelect"
    @keyup.delete="deleteKeyPress"
    @keyup.c="cancelTarget"
  >
    <game-controls
      v-if="curState"
      :game="props.game"
      :cur-state="curState"
      :cur-step="curStep"
      :last-state="lastState"
      :playing="playing"
      :selected-force="selectedForce"
      :selected-object="selectedObject"
      :view-box="viewBox"
      @set-selected-force="selectedForce = $event"
      @incr-step="incrStep"
      @jump-to-present="jumpToPresent"
      @setGameSeed="setGameSeed"
      @stop-play="stopPlay"
    />
    <state-vue
      v-if="curState"
      ref="stateVue"
      :state="curState"
      :selected-force="selectedForce"
      :selecting-unit="selectingUnit"
      :selected-object="selectedObject"
      @set-selected-object-id="setSelectedObjectId"
    />
  </div>
</template>

<style scoped>
  .container {
    display: flex;
    outline: none;
  }
</style>
