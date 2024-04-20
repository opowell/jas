<script setup lang="ts">
  import { computed } from '@vue/reactivity'
  import { GameObject } from '../../../../../model/GameObject'

  const props = defineProps<{ object: GameObject, selected: boolean }>()

  const objectStyle = computed(() => {
    return {
    }
  })

  const objectClasses = computed(() => {
    return {
      selected: props.selected,
    }
  })

  import { getCurrentInstance } from 'vue'
  const { emit } = getCurrentInstance()

  defineEmits(['start-drag', 'stop-drag'])

  function startDrag(index: number) {
    emit('start-drag', index)
  }
  function stopDrag() {
    emit('stop-drag')
  }
</script>

<template>
  <div
    class="object"
    :style="objectStyle"
    :class="objectClasses"
    @click.stop="emit('click')"
  />
</template>

<style scoped>
  .object {
    position: absolute;
    background-color: red;
    border: 1px solid black;
    border-radius: 50%;
    box-sizing: border-box;
    z-index: 3;
  }
  .selected {
    border-color: #27ff46;
  }
</style>
