<template>
  <div>
    <button @click="generateDeck">Generate deck</button>
    <button @click="drawCard">Draw a card</button>

    <div>
      <h3>Hand:</h3>
      <ul>
        <li v-for="(card, index) in hand" :key="index">{{ card.action }} - {{ card.description }}</li>
      </ul>
    </div>

    <div>
      <h3>Play a Card:</h3>
      <div v-for="(card, index) in hand" :key="index">
        <button @click="playCard(index)">Play {{ card.action }}</button>
      </div>
    </div>

    <!-- Formulaire pour l'action Hitman -->
    <div v-if="isHitmanActive">
      <h3>Hitman Action</h3>
      <form @submit.prevent="submitHitmanAction">
        <label for="hitmanTarget">Enter a number:</label>
        <input type="number" v-model="hitmanNumber" id="hitmanTarget" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMyUserStore } from './stores/user' 

const userStore = useMyUserStore()
const hand = computed(() => userStore.hand)
const isHitmanActive = computed(() => userStore.isHitmanActive) // Liaison avec l'état dans le store

// Nouvelle variable pour stocker la valeur saisie
const hitmanNumber = ref<number | null>(null)

const generateDeck = () => {
  userStore.distributeCard()
}

const drawCard = () => {
  userStore.pickUpCard()
}

const playCard = (index: number) => {
  userStore.useCard(index)
}

// Fonction pour envoyer la valeur saisie à la fonction hitman
const submitHitmanAction = () => {
  if (hitmanNumber.value !== null) {
    userStore.executeHitmanAction(hitmanNumber.value) // On appelle une nouvelle méthode du store
    hitmanNumber.value = null // On réinitialise le champ
  }
}
</script>
