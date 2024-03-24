<template>
  <div class="game-screen">
    Game Screen
  </div>
</template>
<script>
export default {
  name: 'GameScreen',
  props: {
    game: { type: Object, required: true }
  }
}
</script>
<style scoped>
.game-screen {
  width: 10rem;
  height: 10rem;
  background-color: black;
}
</style>