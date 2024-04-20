<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { Location } from '../../../../../model/Location'
  import { getCurrentInstance } from 'vue'
  import { Z_INDEXES } from '../../../utils'
  const instance = getCurrentInstance()
  const emit = instance ? instance.emit : null

  const props = defineProps<{ position: Location; selected: boolean }>()

  const objectStyle = computed(() => {
    const size = 10
    return {
      left: props.position.x - size / 2 + 'px',
      top: props.position.y - size / 2 + 'px',
      width: size + 'px',
      height: size + 'px',
      'z-index': props.selected
        ? Z_INDEXES.SELECTED_ORDER_START_POSITION
        : Z_INDEXES.ORDER_START_POSITION,
    }
  })

  function handleClick($event: MouseEvent) {
    console.log('click')
    if (emit) emit('clickCustom', $event)
  }

  const objectClasses = computed(() => {
    return {
      selected: props.selected,
    }
  })
</script>

<template>
  <div
    class="order-start-position"
    :style="objectStyle"
    :class="objectClasses"
  />
</template>

<style scoped>
  .order-start-position {
    position: absolute;
    background-color: yellow;
    border: 1px solid black;
    box-sizing: border-box;
  }
  .selected {
    border-color: #27ff46;
  }
</style>
