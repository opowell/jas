<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { getCurrentInstance } from 'vue'
  import { Z_INDEXES } from '../../../../utils'
  import { Location } from '../../../../../../model/Location'
  const { emit } = getCurrentInstance()

  const props = defineProps<{
    start: Location
    orientation: number
    unitRadius: number
    color: string
  }>()

  const MARGIN = 5
  const GUN_SIZE = 5
  const objectStyle = computed(() => {
    if (props.orientation === undefined) return {}
    const start = props.start
    let end = new Location(
      Math.cos(props.orientation) + start.x,
      Math.sin(props.orientation) + start.y
    )
    let width = end.x - start.x
    let height = end.y - start.y
    const curLength = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2))
    const length = GUN_SIZE + props.unitRadius
    const scalingParam = length / curLength
    end = new Location(end.x * scalingParam, end.y * scalingParam)
    width = width * scalingParam
    height = height * scalingParam
    let angle = (Math.atan(height / width) * 180) / Math.PI
    if (width < 0) angle = angle - 180

    return {
      left: start.x + 'px',
      top: start.y - MARGIN + 'px',
      width: length + 'px',
      transform: `rotate(${angle}deg)`,
      height: 1 + 'px',
      'margin-top': MARGIN + 'px',
      'margin-bottom': MARGIN + 'px',
      'transform-origin': '0 0',
      'z-index': Z_INDEXES.GUN,
      'background-color': props.color,
    }
  })
  function handleClick($event: MouseEvent) {
    emit('click-custom', $event)
  }
</script>

<template>
  <div class="gun" :style="objectStyle" @click.stop.prevent="handleClick" />
</template>

<style scoped>
  .gun {
    position: absolute;
  }
</style>
