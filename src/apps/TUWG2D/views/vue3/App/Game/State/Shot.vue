<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { getCurrentInstance } from 'vue'
  import { Z_INDEXES } from '../../../utils'
  import { Shot } from '../../../../../model/Shot'
  const { emit } = getCurrentInstance()

  const props =
    defineProps<{ shot: Shot; }>()

  const MARGIN = 5
  const objectStyle = computed(() => {
    if (!props.shot) return {}
    const shot = props.shot
    const start = shot.start
    const end = shot.end
    const width = end.x - start.x
    const height = end.y - start.y
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
      'z-index': Z_INDEXES.SHOT,
    }
  })
  function handleClick($event: MouseEvent) {
    emit('click-custom', $event)
  }

  const objectClasses = computed(() => {
    return {}
  })
</script>

<template>
  <div
    class="shot"
    :style="objectStyle"
    :class="objectClasses"
    @click.stop.prevent="handleClick"
  />
</template>

<style scoped>
  .shot {
    position: absolute;
    background-color: rgb(228, 0, 0);
  }
</style>
