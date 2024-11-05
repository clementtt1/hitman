<template>
  <div>
    <button @click="generateDeck">Generate deck</button>

    <div>
      <h3>Hand:</h3>
      <ul>
        <li v-for="(card, index) in hand" :key="index">{{ card.action }} - {{ card.description }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyUserStore } from './stores/user' 
import { computed } from 'vue'

const userStore = useMyUserStore()

const hand = computed(() => userStore.hand)

const generateDeck = () => {
  userStore.distributeCard()
}
</script>
