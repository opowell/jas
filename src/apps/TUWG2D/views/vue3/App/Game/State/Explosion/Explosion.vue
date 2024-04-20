<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { getCurrentInstance } from 'vue'
  import { Z_INDEXES } from '../../../../utils'
  import { Explosion } from '../../../../../../model/Explosion'
  const { emit } = getCurrentInstance()
  import explosionSvg from './explosion.png'

  const props = defineProps<{ explosion: Explosion }>()

  const radius = 10
  const objectStyle = computed(() => {
    if (!props.explosion) return {}
    const explosion = props.explosion
    return {
      left: explosion.location.x - radius + 'px',
      top: explosion.location.y - radius + 'px',
      width: 2 * radius + 'px',
      height: 2 * radius + 'px',
      'z-index': Z_INDEXES.EXPLOSION,
      opacity: explosion.durationRemaining / explosion.durationRemainingInitial,
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
  <img
    :src="explosionSvg"
    class="explosion"
    :style="objectStyle"
    :class="objectClasses"
    @click.stop.prevent="handleClick"
  />
</template>

<style scoped>
  .explosion {
    position: absolute;
  }
</style>
