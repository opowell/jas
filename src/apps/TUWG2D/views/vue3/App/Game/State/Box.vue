<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { Box } from '@/games/TUWG2D/model/Box'
  import { Z_INDEXES } from '../../../utils'

  const props = defineProps<{ object: Box }>()

  const objectStyle = computed(() => {
    return {
      left: props.object.data.position.x - props.object.data.size / 2 + 'px',
      top: props.object.data.position.y - props.object.data.size / 2 + 'px',
      width: props.object.data.size + 'px',
      height: props.object.data.size + 'px',
      'z-index': Z_INDEXES.BOX,
    }
  })
</script>

<template>
  <div class="object" :style="objectStyle" />
</template>

<style scoped>
  .object {
    position: absolute;
    background-color: rgb(120, 120, 120);
    box-sizing: border-box;
  }
</style>
