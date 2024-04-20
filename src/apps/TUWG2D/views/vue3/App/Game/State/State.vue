<script setup lang="ts">
  import BoxVue from './Box.vue'
  import GameObject from './GameObject.vue'
  import ExplosionVue from './Explosion/Explosion.vue'
  import OrderStartPosition from './OrderStartPosition.vue'
  import OrderVue from './Order.vue'
  import ShotVue from './Shot.vue'
  import TargetOrderVue from './TargetOrder.vue'
  import UnitVue from './Unit/Unit.vue'
  import VisionVue from './Vision.vue'

  import { computed, ref, watchEffect, getCurrentInstance } from 'vue'

  import { Explosion } from '../../../../../model/Explosion'
  import { GameObject as GameObjectType } from '../../../../../model/GameObject'
  import { Location } from '../../../../../model/Location'
  import { Order } from '../../../../../model/Order'
  import { State } from '../../../../../model/State'
  import { TargetOrder } from '../../../../../model/TargetOrder'
  import { Unit } from '../../../../../model/Unit'

  import { CLICK_MODES, Z_INDEXES } from '../../../utils'
  // import pistolMp3 from './pistol.mp3'
  import pistolMp3 from './laser.mp3'
  import hitMp3 from './explosion-6055.mp3'
  // import { useStore } from './store/pinia'

  const { emit } = getCurrentInstance()

  const audio = new Audio(pistolMp3)
  const hitAudio = new Audio(hitMp3)
  const board = ref(null)
  // const store = useStore()

  const props = defineProps<{
    selectedForce: string
    selectedObject: GameObjectType | null
    selectingUnit: boolean
    state: State
  }>()

  const clickMode = ref(CLICK_MODES.CLEAR_SELECTION)
  const mousePositionX = ref(null)
  const mousePositionY = ref(null)

  // COMPUTED
  const curStateHasShot = computed(() => {
    if (!props.state) return false
    for (let i = 0; i < props.state.data.objects.length; i++)
      if (props.state.data.objects[i].constructor.name === 'Shot') return true
    return false
  })

  const curStateHasShotHit = computed(() => {
    if (!props.state) return false
    for (let i = 0; i < props.state.data.objects.length; i++) {
      const objectI = props.state.data.objects[i]
      if (objectI.constructor.name === 'Explosion') {
        const explosion = objectI as Explosion
        if (
          explosion.durationRemainingInitial - explosion.durationRemaining <
          300
        )
          return true
      }
    }
    return false
  })

  const draftOrderMove = computed(() => {
    return clickMode.value === CLICK_MODES.MOVE
  })

  const draftOrderTarget = computed(() => {
    return clickMode.value === CLICK_MODES.TARGET
  })

  const draftOrder = computed(() => {
    if (!props.selectedObject) return null
    if (!mousePositionX.value) return null
    if (!mousePositionY.value) return null
    switch (clickMode.value) {
      case CLICK_MODES.MOVE:
        return new Order(
          new Location(mousePositionX.value, mousePositionY.value)
        )
      case CLICK_MODES.TARGET:
        return new TargetOrder(
          new Location(mousePositionX.value, mousePositionY.value)
        )
      case CLICK_MODES.CLEAR_SELECTION:
        return null
      default:
        return null
    }
  })

  const visibleObjects = computed(() => {
    const out: GameObjectType[] = []
    const objects = props.state?.data.objects
    if (!objects) return out
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      if (object.constructor.name !== 'Unit') out.push(object)
      else {
        if ((object as Unit).data.force === props.selectedForce)
          out.push(object)
        else if (visibleByForce(object)) {
          out.push(object)
        }
      }
    }
    return out
  })
  const selectedUnit = computed(() => {
    if (!props.selectedObject) return undefined
    return props.selectedObject as Unit
  })

  const units = computed(() => {
    const out: Unit[] = []
    const objects = props.state?.data.objects
    if (!objects) return out
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      if (
        object.constructor.name === 'Unit' &&
        (object as Unit).data.force === props.selectedForce
      )
        out.push(object as Unit)
    }
    return out
  })

  const unitsWithVision = computed(() => {
    return units.value.filter((u) => u.data.health > 0)
  })

  const draftTargetLocation = computed(() => {
    if (!mousePositionX.value) return undefined
    if (!mousePositionY.value) return undefined
    return new Location(mousePositionX.value, mousePositionY.value)
  })

  // end COMPUTED

  // METHODS
  function optionClicked() {
    console.log('option clicked')
  }
  function visibleByForce(object: GameObjectType) {
    for (let i = 0; i < units.value.length; i++) {
      const unit = units.value[i]
      if (unit.canSee(object)) return true
    }
    return false
  }

  function setMouseCoordinates($event: MouseEvent) {
    let x = $event.offsetX
    let y = $event.offsetY
    if ($event.target !== board.value && board.value) {
      x = $event.clientX - board.value.getBoundingClientRect().x
      y = $event.clientY - board.value.getBoundingClientRect().y
    }
    mousePositionX.value = x
    mousePositionY.value = y
    if (draggedItem) {
      draggedItem.destination.x = x
      draggedItem.destination.y = y
    }
  }
  function deleteLastOrder() {
    if (props.selectedObject) {
      ;(props.selectedObject as Unit).popOrder()
    }
  }

  function clickBoard($event: MouseEvent) {
    let x = $event.offsetX
    let y = $event.offsetY
    if ($event.target !== board.value && board.value) {
      x = $event.clientX - board.value.getBoundingClientRect().x
      y = $event.clientY - board.value.getBoundingClientRect().y
    }
    switch (clickMode.value) {
      case CLICK_MODES.CLEAR_SELECTION:
        setSelectedObject(undefined)
        break
      case CLICK_MODES.TARGET:
        if (props.selectedObject) {
          props.selectedObject.addTargetOrder(new Location(x, y))
        }
        clickMode.value = CLICK_MODES.CLEAR_SELECTION
        break
      case CLICK_MODES.MOVE:
        if (props.selectedObject) {
          props.selectedObject.clickBoard(new Location(x, y))
        }
        clickMode.value = CLICK_MODES.CLEAR_SELECTION
        break
    }
  }

  function setSelectedObject(object: GameObjectType | undefined) {
    emit('set-selected-object-id', object?.id)
    if (object) setClickMode(CLICK_MODES.CLEAR_SELECTION)
  }

  function setClickMode(mode: number) {
    clickMode.value = mode
  }

  function cancelTarget() {
    if (props.selectedObject) {
      ;(props.selectedObject as Unit).cancelTarget()
    }
  }

  function onRightClick() {
    console.log('right click')
  }
  const draftOrderStart = computed(() => {
    if (selectedObjectLastMoveOrder.value)
      return selectedObjectLastMoveOrder.value.destination
    if (!props.selectedObject) return undefined
    const object = props.selectedObject
    return object.data.position
  })

  const selectedObjectLastMoveOrder = computed(() => {
    if (!props.selectedObject) return undefined
    const object = props.selectedObject
    const orders = object.data.orders

    let i = orders.length - 1
    while (i >= 0) {
      if (orders[i].constructor.name === 'Order') return orders[i]
      i--
    }
    return undefined
  })

  let draggedItem: undefined | typeof Order

  function startDrag(order: typeof Order): void {
    draggedItem = order
  }
  function stopDrag(): void {
    draggedItem = undefined
  }

  function getComponent(object: GameObjectType) {
    switch (object.constructor.name) {
      case 'Unit':
        return UnitVue
      case 'Box':
        return BoxVue
      case 'Shot':
        return ShotVue
      case 'Explosion':
        return ExplosionVue
    }
  }

  function getProps(object: GameObjectType) {
    const out = {
      object,
    }

    switch (object.constructor.name) {
      case 'Unit':
        out.selected = false
        if (props.selectedObject && object.id === props.selectedObject.id)
          out.selected = true
        out.selectingUnit = props.selectingUnit
        return out
      case 'Box':
        return out
      case 'Shot':
        out.shot = object
        return out
      case 'Explosion':
        out.explosion = object
        return out
      default:
        return out
    }
  }

  const gunShot = watchEffect(() => {
    if (!curStateHasShot.value || !curStateHasShot.value) return
    audio.pause()
    audio.currentTime = 0
    audio.play()
  })
  const hit = watchEffect(() => {
    if (!curStateHasShotHit.value || !curStateHasShotHit.value) return
    setTimeout(() => {
      hitAudio.pause()
      hitAudio.currentTime = 0
      hitAudio.play()
    }, 100)
  })

  // eslint-disable-next-line no-undef
  defineExpose({
    board,
    deleteLastOrder,
    setClickMode,
  })

  const boardWidth = props.state.game.width + 'px'
  const boardHeight = props.state.game.height + 'px'

  defineEmits(['set-selected-object-id'])
</script>

<template>
  <div
    v-if="state"
    ref="board"
    class="board"
    @click="clickBoard"
    @mousemove="setMouseCoordinates"
  >
    <component
      :is="getComponent(object)"
      v-for="object in visibleObjects"
      :key="object.id"
      v-bind="getProps(object)"
      @start-drag="startDrag"
      @stop-drag="stopDrag"
      @select="setSelectedObject(object)"
    />
    <order-start-position
      v-if="draftOrderStart && selectedObjectLastMoveOrder"
      :position="draftOrderStart"
      :selected="true"
      @mousedown.stop="startDrag(selectedObjectLastMoveOrder)"
      @mouseup.stop="stopDrag"
      @click.stop.prevent
    />
    <order-vue
      v-if="draftOrder && draftOrderStart && draftOrderMove"
      :order="draftOrder"
      :start="draftOrderStart"
      :selected="true"
      @click-custom.stop="clickBoard"
    />
    <target-order-vue
      v-if="draftOrder && draftOrderStart && draftOrderTarget"
      :order="draftOrder"
      :start="draftOrderStart"
      :selected="true"
      @click-custom.stop="clickBoard"
    />
    <vision-vue :units="unitsWithVision" :state="state" />
    <vision-vue
      v-if="selectedUnit"
      :units="[selectedUnit]"
      :state="state"
      :style="{ stroke: '#00c500', fill: '#00d70021' }"
      :inside="true"
    />
    <vision-vue
      v-if="draftOrderTarget"
      :units="[]"
      :start-unit="selectedUnit"
      :start="draftOrderStart"
      :end="draftTargetLocation"
      :state="state"
      :style="{
        'stroke-dasharray': 5,
        stroke: 'red',
        fill: 'rgb(215 0 0 / 13%)',
      }"
      :inside="true"
    />
  <vue-simple-context-menu
    element-id="myUniqueId"
    :options="['edit', 'add']"
    ref="vueSimpleContextMenu"
    @option-clicked="optionClicked"
  />
  </div>
</template>

<style scoped>
  .board {
    width: v-bind('boardWidth');
    height: v-bind('boardHeight');
    border: 1px solid black;
    position: relative;
    overflow: hidden;
  }
</style>
