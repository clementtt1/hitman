<template>
    <div class="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg space-y-6">
        <div class="w-full max-w-3xl p-8">
            <h1 class="text-2xl font-semibold">La pioche : </h1>
            <div class="flex mt-3 space-x-2">
                <AppCard :model-value="userStore.deck.length.toString()" @click="playerMove(999, true)" class="cursor-pointer" />
                <AppCard :model-value="userStore.lastPlayedCard?.action" class="cursor-pointer" />
            </div>
        </div>

        <div class="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Votre main:</h3>
            <ul class="flex overflow-x-scroll space-y-2">
                <li v-for="(card, index) in userStore.hand" :key="index" class="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm">
                    <div class="flex items-center space-x-4">
                        <AppCard :model-value="card.action" @click="playerMove(index, false)" class="cursor-pointer" />
                    </div>
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
</template>


<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUserStore } from '~/stores/user'
import { Actions } from '~/enums/Actions'
import { io, Socket } from 'socket.io-client'
import type Card from '~/classes/Card'
import AppCard from "@/components/AppCard.vue"
import { Status } from '~/enums/Status'

const userStore = useUserStore()
const isHitmanActive = computed(() => userStore.isHitmanActive)
const hitmanNumber = ref<number | null>(null)
const socket = ref<Socket>()

const playerMove = (index: number, draw: boolean) => {
    if (draw) userStore.playerChoice(Actions.DRAW, socket.value)
    userStore.useCard(index, socket.value)
}

const submitHitmanAction = () => {
    if (hitmanNumber.value !== null) {
        userStore.executeHitmanAction(hitmanNumber.value)
        hitmanNumber.value = null
    }
}

onMounted(() => {
    socket.value = io('/play', { path: '/api/socket.io' })

    socket.value.on('updateLastPlayedCard', (card: Card) => {
        userStore.lastPlayedCard = card;
    });

    socket.value.on('deck', (updatedDeck: Card[]) => {
        userStore.deck = updatedDeck; 
    });

    socket.value.on('updateHands', (playersList: { uuid: string, hand: Card[] }[]) => {
        playersList.forEach(playerData => {
            const player = userStore.players.find(p => p.uuid === playerData.uuid);
            if (player) {
                player.hand = playerData.hand;

                if (player.uuid === userStore.uuid) {
                    userStore.hand = playerData.hand;
                }
            } else {
                userStore.players.push({
                    uuid: playerData.uuid,
                    hand: playerData.hand,
                    name: "",
                    status: Status.ALIVE
                });
            }
        });
    });

    socket.value.on('cardDrawn', (drawnCard: Card) => {
        if (drawnCard) userStore.hand.push(drawnCard)
    })

    socket.value.on('cardDrawnBottom', (drawnCard: Card) => {
        if (drawnCard) userStore.hand.push(drawnCard)
    })

    socket.value.on('seeCards', (cards: Card[]) => {
        console.log(cards)
    })

    socket.value.on('suffleDeck', (updatedDeck: Card[]) => {
        userStore.deck = updatedDeck;
    });


    socket.value.on('replicateCard', () => {
        if(userStore.lastPlayedCard){
            userStore.hand.push(userStore.lastPlayedCard)
        }
        playerMove(userStore.hand.length - 1, false)
    })

    
})

onBeforeUnmount(() => {
    socket.value?.disconnect()
})
</script>