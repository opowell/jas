<template>
  <div class="app">
    <div class="app-icon">{{ app[0].toUpperCase() }}</div>
    <div class="app-name">{{ app }}</div>
  </div>
</template>
<script>
export default {
  name: 'LaunchpadApp',
  props: {
    app: { type: String, required: true }
  }
}
</script>
<style scoped>
.app {
  display: flex;
  grid-gap: 0.5rem;
  width: 10rem;
  flex-direction: column;
  padding: 0.5rem;
  border-radius: 0.5rem;
}
.app:hover {
  background-color: #88337769;
  cursor: pointer;
}
.app-icon {
  background-color: #c5aaaa;
  height: 9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
}
.app-name {
  color: white;
  display: flex;
  justify-content: center;
}
</style>