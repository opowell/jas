<script setup lang="ts">
import TUWG2DView from './Game/Game.vue'
import MainMenu from './MainMenu.vue'

import { ref } from 'vue'
import { GameFactory } from '../../../model/GameFactory'
import { useStore } from '../store/pinia'

const width = window.innerWidth
const height = window.innerHeight
const game = ref()

const appState = ref(0)

function startGame() {
  game.value = GameFactory.createSimpleGame()
  appState.value = 1
}

// const store = useStore()
// store.game = game
</script>

<template>
  <MainMenu v-if="appState === 0" @start-game="startGame"/>
  <TUWG2DView v-if="appState === 1" :game="game" />
</template>

<style>
  body {
    margin: 0;
  }
</style>
