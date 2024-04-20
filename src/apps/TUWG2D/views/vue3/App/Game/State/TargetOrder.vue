<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { TargetOrder } from '@tuwg/model/TargetOrder'
  import { Location } from '@tuwg/model/Location'
  import { getCurrentInstance } from 'vue'
  import { Z_INDEXES } from '../../../utils'
  const { emit } = getCurrentInstance()

  const props =
    defineProps<{ order: TargetOrder; start: Location; selected: boolean }>()

  const MARGIN = 5
  const objectStyle = computed(() => {
    if (!props.order) return {}
    const order = props.order
    const start = props.start
    const width = order.target.x - start.x
    const height = order.target.y - start.y
    let angle = (Math.atan(height / width) * 180) / Math.PI
    if (width < 0) angle = angle - 180

    const length = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
    return {
      left: start.x + 'px',
      top: start.y - MARGIN + 'px',
      width: length + 'px',
      transform: `rotate(${angle}deg)`,
      height: 1 + 'px',
      'margin-top': MARGIN + 'px',
      'margin-bottom': MARGIN + 'px',
      'transform-origin': '0 0',
      'z-index': props.selected ? Z_INDEXES.SELECTED_ORDER : Z_INDEXES.ORDER,
    }
  })
  function handleClick($event: MouseEvent) {
    emit('click-custom', $event)
  }

  const objectClasses = computed(() => {
    return {
      selected: props.selected,
    }
  })
</script>

<template>
  <div
    class="order"
    :style="objectStyle"
    :class="objectClasses"
    @click.stop.prevent="handleClick"
  />
</template>

<style scoped>
  .order {
    position: absolute;
    background-color: rgb(111, 0, 0);
  }
  .selected {
    background-color: red;
  }
</style>
