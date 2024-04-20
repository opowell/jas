<script setup lang="ts">
import { ref, onMounted } from "vue";
const emit = defineEmits(['resume-game'])
const selectedIndex = ref(0);

const background = ref();
onMounted(() => {
  background.value.focus();
})

function handleUp() {
  if (selectedIndex.value === 0) {
    selectedIndex.value = 2;
  } else {
    selectedIndex.value--;
  }
}

function handleDown() {
  if (selectedIndex.value === 2) {
    selectedIndex.value = 0;
  } else {
    selectedIndex.value++;
  }
}

function handleEnter() {
  if (selectedIndex.value === 0) emit('resume-game')
}
</script>

<template>
  <div
    ref="background"
    class="background"
    tabindex="0"
    @keyup.up="handleUp"
    @keyup.down="handleDown"
    @keyup.enter="handleEnter"
  >
    <div class="entry" :class="{ selected: selectedIndex === 0 }">Resume game</div>
    <div class="entry" :class="{ selected: selectedIndex === 1 }">Quit</div>
  </div>
</template>

<style>
.background {
  width: calc(100vw - 28rem);
  height: calc(100vh - 28rem);
  background-color: black;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
  color: #888;
  padding: 14rem;
  font-size: 3rem;
  outline: none;
}
.title {
  margin-bottom: 3rem;
  color: rgb(18 213 50);
}
.entry {
  position: relative;
}
.entry.selected {
  color: white;
}
.entry.selected::before {
  content: ">";
  position: absolute;
  left: -3rem;
}
</style>
