<script setup lang="ts">
  import { TUWG2DGame } from '@/games/TUWG2D/model/Game'
  import { computed } from 'vue'
  import { State } from '../../../../../model/State'
  import ViewBox from '../ViewBox'

  const props = defineProps<{
    curState: State
    game: TUWG2DGame
    viewBox: ViewBox
  }>()

  const boardWidth = props.game.width / 10 + 'px'
  const boardHeight = props.game.height / 10 + 'px'

  const viewWidth = props.viewBox.width / 10 + 'px'
  const viewHeight = props.viewBox.height / 10 + 'px'

</script>

<template>
  <div class="minimap">
    minimap
    <div class="viewBox" />
  </div>
</template>

<style scoped>
  .minimap {
    background-color: red;
    width: v-bind('boardWidth');
    height: v-bind('boardHeight');
    position: relative;
  }
  .viewBox {
    border: 1px solid white;
    width: v-bind('viewWidth');
    height: v-bind('viewHeight');
    top: v-bind('viewTop');
    bottom: v-bind('viewBottom');
  }
</style>
