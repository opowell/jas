<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { getCurrentInstance } from 'vue'
  import { Z_INDEXES } from '../../../../utils'
  import { Unit } from '../../../../../../model/Unit'
  const { emit } = getCurrentInstance()

  const props = defineProps<{ unit: Unit }>()

  const objectStyle = computed(() => {
    if (!props.unit) return {}
    return {
      left: props.unit.data.position.x - props.unit.data.vision + 'px',
      top: props.unit.data.position.y - props.unit.data.vision + 'px',
      width: 2 * props.unit.data.vision + 'px',
      height: 2 * props.unit.data.vision + 'px',
      'background-color': 'red',
      'z-index': Z_INDEXES.VISION,
    }
  })
  function handleClick($event: MouseEvent) {
    emit('click-custom', $event)
  }
</script>

<template>
  <div class="vision" :style="objectStyle" @click.stop.prevent="handleClick" />
</template>

<style scoped>
  .vision {
    position: absolute;
    background-color: black;
    border-radius: 50%;
  }
</style>
