<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { Unit } from '../../../../../../model/Unit'
  import { Order } from '../../../../../../model/Order'

  import FieldOfVision from './FieldOfVision.vue'
  import GunVue from './Gun.vue'
  import OrderStartPosition from '../OrderStartPosition.vue'
  import OrderVue from '../Order.vue'
  import ShotVue from '../Shot.vue'
  import TargetVue from './Target.vue'

  const props = defineProps<{
    object: Unit
    selected: boolean
    selectingUnit: boolean
  }>()

  const trackIndex = -1
  const objectStyle = computed(() => {
    const alpha = props.object.data.health / 10
    const r = props.object.data.colour.r
    const g = props.object.data.colour.g
    const b = props.object.data.colour.b
    return {
      width: props.object.data.size + 'px',
      height: props.object.data.size + 'px',
      'background-color': props.selected
        ? `rgba(0, 255, 0, ${alpha})`
        : `rgba(${r}, ${g}, ${b}, ${alpha}`,
      'z-index': Z_INDEXES.UNIT,
    }
  })
  const wrapperObjectStyle = computed(() => {
    return {
      left: props.object.data.position.x - props.object.data.size / 2 + 'px',
      top: props.object.data.position.y - props.object.data.size / 2 + 'px',
      'z-index': Z_INDEXES.UNIT,
      transform: 'rotate(' + rotation.value + ')'
    }
  })

  const highlightSizePadding = 20
  const selectHighlightStyle = computed(() => {
    return {
      left:
        props.object.data.position.x -
        props.object.data.size / 2 -
        highlightSizePadding / 2 +
        'px',
      top:
        props.object.data.position.y -
        props.object.data.size / 2 -
        highlightSizePadding / 2 +
        'px',
      width: props.object.data.size + highlightSizePadding + 'px',
      height: props.object.data.size + highlightSizePadding + 'px',
      'z-index': Z_INDEXES.UNIT_SELECT_HIGHLIGHT,
    }
  })

  const orderStartPositions = computed(() => {
    const orders = props.object.data.orders
    const out = []
    let orderStartLocation = props.object.data.position
    for (let i = 0; i < orders.length; i++) {
      out.push(orderStartLocation)
      if (orders[i].constructor.name === 'Order') {
        orderStartLocation = orders[i].destination
      }
    }
    return out
  })

const visibleOrderStartPositions = computed(() => {
    return orderStartPositions.value.slice(1)
  })

const targetStartPosition = computed(() => {
    return props.object.data.position
  })

  function handleClick() {
    emit('select')
  }

  function selectOrder(order: Order) {
    props.object.addSelectedOrder(order)
  }

  const objectClasses = computed(() => {
    return {
      selected: props.selected,
    }
  })

  const facedDirection = computed(() => {
    return props.object.data.orientationMove + props.object.data.orientationGun
  })

  import { getCurrentInstance } from 'vue'
  import { angle, Z_INDEXES } from '../../../../utils'
  const { emit } = getCurrentInstance()

  defineEmits(['start-drag', 'stop-drag', 'select'])

  function startDrag(index: number) {
    emit('start-drag', props.object.data.orders[index])
  }
  function stopDrag() {
    emit('stop-drag')
  }

  const x = Math.sin(props.object.data.orientationMove) * 10
  const y = Math.cos(props.object.data.orientationMove) * 12
  const rotation = computed(() => props.object.data.orientationMove + 'rad')
</script>

<template>
  <order-vue
    v-for="(order, index) in object.data.orders"
    :key="index"
    :order="order"
    :start="orderStartPositions[index]"
    :selected="selected"
    @click="selectOrder(order)"
  />
  <target-vue
    v-if="object.data.target"
    :target="object.data.target"
    :start="targetStartPosition"
    :selected="selected"
  />
  <order-start-position
    v-for="(position, index) in visibleOrderStartPositions"
    :key="index"
    :position="position"
    :selected="selected"
    @mousedown.stop="startDrag(index - 1)"
    @mouseup.stop="stopDrag"
    @click.stop.prevent
  />
  <div class="object-wrapper" :style="wrapperObjectStyle">
    <div
    class="object"
    :style="objectStyle"
    :class="objectClasses"
    @click.stop="handleClick"
    >
      <div class="left-track track" />
      <div class="right-track track" />
    </div>
  </div>
  <div
    v-if="selectingUnit"
    class="select-highlight"
    :style="selectHighlightStyle"
    @click.stop="handleClick"
  >
    {{ object.id }}
  </div>
  <gun-vue
    :orientation="facedDirection"
    :start="object.data.position"
    :unit-radius="object.data.size / 2"
    color="black"
  />
  <gun-vue
    :orientation="object.data.orientationMove"
    :start="object.data.position"
    :unit-radius="object.data.size / 2"
    color="green"
  />
  <shot-vue v-if="object.data.shot" :shot="object.data.shot" />
</template>

<style scoped>
  .object {
    background-color: red;
    border: 1px solid black;
    border-radius: 50%;
    box-sizing: border-box;
  }
  .object-wrapper {
    position: absolute;
  }
  .selected {
    border-color: #27ff46;
  }

  .track {
    position: absolute;
    z-index: v-bind(trackIndex);
    width: 20px;
    height: 6px;
    background-color: black;
    top: -3px;
    left: -1px;
    border-radius: 3px;
  }

  .right-track {
    top: unset;
    bottom: -3px;
    left: -1px;
  }

  .select-highlight {
    position: absolute;
    background-color: rgb(0 211 81 / 63%);
    border: 1px solid rgb(0, 144, 43);
    border-radius: 50%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
