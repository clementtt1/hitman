<template>
    <div class="min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
            <h3 class="text-2xl font-semibold text-gray-800 mb-6 text-center">Joueurs en ligne</h3>
            
            <ul class="space-y-4 mb-6">
                <li
                    v-for="player in players"
                    :key="player.uuid"
                    class="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-md hover:bg-gray-100 transition duration-200"
                >
                    <span class="text-xl text-gray-800">{{ player.name }}</span>
                    <span
                        class="font-semibold"
                    >
                        {{ player.status }}
                    </span>
                </li>
            </ul>

            <div class="flex justify-center">
                <NuxtLink
                    class="w-full md:w-64 bg-blue-600 text-white py-3 rounded-lg text-center hover:bg-blue-700 transition duration-200"
                    @click.prevent="startGame"
                >
                    Lancer la partie
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '~/stores/user';
import { io, Socket } from 'socket.io-client';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; 
import type Card from '~/classes/Card';

const userStore = useUserStore();
const players = computed(() => userStore.players);
const socket = ref<Socket>();

onMounted(() => {
    socket.value = io('/play', { path: '/api/socket.io' });

    socket.value.on('deck', (deck: Card[]) => {
        userStore.deck = deck
    })

    socket.value.on('distributeCard', (playersList: { uuid: string, hand: Card[] }[]) => {
        playersList.forEach(playerData => {
            const player = userStore.players.find(p => p.uuid === playerData.uuid)
            if (player) {
                player.hand = playerData.hand
                if (player.uuid === userStore.uuid) {
                    userStore.hand = playerData.hand
                }
            }
        })
    })

    socket.value.on('startGame', () => {
        router.push('/game');  
    });
});

const startGame = () => {
    if (socket.value) {
        socket.value.emit('startGame');  
    }
};

const router = useRouter();
</script>
