<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">

    <div v-if="!isLoggedIn" class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
      <h1 class="text-2xl font-semibold text-blue-600 mb-4">Bienvenue sur le jeu !</h1>
      <input
        v-model="playerName"
        class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Entrez votre nom"
      />
      <button @click="onSend" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300">Se connecter</button>
    </div>


    <div v-if="isLoggedIn" class="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg space-y-6">
      
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-700">Bienvenue, {{ playerName }} !</h2>
        <div class="flex space-x-4">
          <button @click="generateDeck" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300">Générer le deck</button>
          <button @click="drawCard" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
            Tirer une carte
          </button>
        </div>
      </div>

      
      <div class="w-full max-w-3xl p-8">
        <h1 class="text-2xl font-semibold ">La pioche : </h1>
        <div v-for="card in deck">
          {{ card.action }} - {{ card.description }}
        </div>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Joueurs en ligne:</h3>
        <ul class="space-y-2">
          <li v-for="player in players" :key="player.uuid" class="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
            <span class="text-gray-700">{{ player.name }}</span>
            <span :class="{'text-green-500': player.status === Status.ALIVE, 'text-red-500': player.status !== Status.ALIVE}" class="font-medium">
              {{ player.status }}
            </span>
          </li>
        </ul>
      </div>

      <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Votre main:</h3>
        <ul class="space-y-2">
          <li v-for="(card, index) in hand" :key="index" class="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
            <span class="text-gray-700">{{ card.action }} - {{ card.description }}</span>
            <button @click="playCard(index)" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">Jouer</button>
          </li>
        </ul>
      </div>

      <div v-if="isHitmanActive" class="bg-yellow-50 p-4 rounded-lg shadow-sm">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Action Hitman</h3>
        <form @submit.prevent="submitHitmanAction" class="space-y-4">
          <input
            type="number"
            v-model="hitmanNumber"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
            placeholder="Entrez un numéro"
            required
          />
          <button type="submit" class="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition duration-300">Valider</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useMyUserStore } from './stores/user' 
import { Status } from "~/enums/Status"
import { io, Socket } from 'socket.io-client'
import type Card from './classes/Card'
import type Player from './classes/Player'

const userStore = useMyUserStore()
const hand = computed(() => userStore.hand)
const isHitmanActive = computed(() => userStore.isHitmanActive) 
const hitmanNumber = ref<number | null>(null)
const deck = ref<Card[]>([])  // Deck partagé récupéré du serveur

const players = ref<Player[]>([])  
const isLoggedIn = ref<boolean>(false)
const playerName = ref<string>("")
const socket = ref<Socket>()

const generateDeck = () => {
  userStore.distributeCard()
}

const drawCard = () => {
  socket.value?.emit('drawCard')  
}

const playCard = (index: number) => {
  userStore.useCard(index)
}

const submitHitmanAction = () => {
  if (hitmanNumber.value !== null) {
    userStore.executeHitmanAction(hitmanNumber.value) 
    hitmanNumber.value = null 
  }
}

function onSend() {
  if (!playerName.value) return
  socket.value?.emit('player', { name: playerName.value }) 
  isLoggedIn.value = true
}

onMounted(() => {
  socket.value = io('/play', {
    path: '/api/socket.io'
  })

  socket.value.on('deck', (updatedDeck: Card[]) => {
    deck.value = updatedDeck  
  })

  socket.value.on('players', (playersList: Player[]) => {
    players.value = playersList
  })

  socket.value.on('cardDrawn', (drawnCard: Card) => {
    if (drawnCard) {
      userStore.hand.push(drawnCard)  
    }
  })

  socket.value.on('seeCards', (cards: Card[]) => {
    console.log("test")
    console.log(cards[0]);
    console.log(cards[1]);
    console.log(cards[2]);
  });

})

onBeforeUnmount(() => {
  socket.value?.disconnect()
})
</script>

