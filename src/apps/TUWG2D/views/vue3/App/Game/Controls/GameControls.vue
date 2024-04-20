<script setup lang="ts">
  import { TUWG2DGame } from '@/games/TUWG2D/model/Game'
  import { computed, getCurrentInstance, ref } from 'vue'
  import MinimapVue from './Minimap.vue'
  import { CLICK_MODES } from '../../../utils'
  import { Unit } from '../../../../../model/Unit'
  import { State } from '../../../../../model/State'
  import { GameObject } from '../../../../../model/GameObject'
  import ViewBox from '../ViewBox'
  import { useStore } from '../../../store/pinia'
  import { storeToRefs } from 'pinia'
  import { bignumber } from 'mathjs'
  const { emit } = getCurrentInstance()

  const props = defineProps<{
    curState: State
    curStep: any
    game: TUWG2DGame
    lastState: State
    playing: boolean
    selectedForce: string
    selectedObject: GameObject | null
    viewBox: ViewBox
  }>()

  const stepSize = ref(bignumber(0.4))
  const mousePositionX = ref(null)
  const mousePositionY = ref(null)
  const stateVue = ref(null)
  const autoTarget = ref(true)

  const store = useStore()
  const { stepIncrement, playbackSpeed } = storeToRefs(store)

  function addUnit() {
    props.game.addUnit()
  }

  function calcNextCollision() {
    props.game.calcNextCollision()
  }

  function incrStep() {
    emit('incrStep')
  }

  function stopPlay() {
    emit('stopPlay')
  }

  const selectingUnit = ref(false)

  function deleteKeyPress() {
    stateVue.value?.deleteLastOrder()
  }

  function jumpToPresent() {
    emit('jumpToPresent')
  }

  function cancelTarget() {
    if (selectedObject.value) {
      ;(selectedObject.value as Unit).cancelTarget()
    }
  }

  function setSelectedForce(force: string) {
    emit('setSelectedForce', force)
  }

  const lastState = computed(() => {
    return props.game.data.states[props.game.data.states.length - 1]
  })

  const events = ref([])
  defineEmits(['incrStep', 'jumpToPresent', 'setSelectedForce', 'stopPlay', 'changeCurStep'])
</script>

<template>
  <div class="float">
    <div class="card">
      <div class="name">Playback</div>
      <div style="display: flex">
        <div>
          Jump to:
          <select
            :value="curStep"
            @change="emit('changeCurStep', $event?.target?.value)"
          >
            <option
              v-for="state in game.data.states"
              :key="state.index"
              :value="state.index"
            >
              {{ state.index }}
            </option>
          </select>
        </div>
        <button :disabled="curStep === lastState.index" @click="jumpToPresent">
          Jump to present
        </button>
        <button :disabled="playing" @click="incrStep">Play</button>
        <button :disabled="!playing" @click="stopPlay">Stop</button>
      </div>
    </div>
    <div class="card">
      <div>status: {{ game.data.status }}</div>
      <div v-if="curState">time next event: {{ curState.nextCollision }}</div>
      <div v-if="curState">
        <span>Auto target: </span>
        <input v-model="curState.data.autoTarget" type="checkbox" />
      </div>
      <div>
        Force:
        <select
          :value="selectedForce"
          @change="setSelectedForce($event?.target?.value)"
        >
          <option value="red">red</option>
          <option value="blue">blue</option>
        </select>
      </div>
    </div>
    <div v-if="selectedObject" class="card">
      <span>Id: {{ selectedObject.id }}</span>
      <span>Destination: {{ selectedObject.destination }}</span>
      <span>Shot delay: {{ selectedObject.data.shotDelay }}</span>
      <span>Health: {{ selectedObject.data.health }}</span>
      <span>Position: {{ selectedObject.data.position.x }} - {{ selectedObject.data.position.y }}</span>
      <span>Orientation Gun: {{ selectedObject.data.orientationGun }}</span>
      <span>Orientation Move: {{ selectedObject.data.orientationMove }}</span>
      <span>Orders: {{ selectedObject.data.orders.length }}</span>
    </div>
    <div class="card">
      Events
      <span v-for="(event, index) in events" :key="index">
        {{ event }}
      </span>
    </div>
    <div v-if="false" class="card">
      <minimap-vue :game="props.game" :cur-state="props.curState" :view-box="viewBox" />
    </div>
  </div>
</template>

<style scoped>
  .float {
    position: absolute;
    z-index: 10;
    right: 0;
  }
  .float > .card {
    padding: 0.5rem;
    margin: 0.5rem;
    display: flex;
    flex-direction: column;
    background-color: #ddd;
    align-items: flex-start;
    padding-right: 1rem;
  }
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    outline: none;
  }
  .name {
    font-weight: bold;
  }
</style>
