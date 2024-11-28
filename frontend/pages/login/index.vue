<template>
    <div class="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 class="text-2xl font-semibold text-blue-600 mb-4">Bienvenue sur le jeu !</h1>
        <input
            v-model="playerName"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Entrez votre nom"
        />
        <NuxtLink to="/lobby" @click="onSend" class="w-full bg-blue-500 text-white p-2 rounded-lg">Se connecter</NuxtLink>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '~/stores/user';
import { Status } from "~/enums/Status"
import { io, Socket } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'
import type Player from '~/classes/Player';

const userStore = useUserStore();
const socket = ref<Socket>()
const playerName = ref<string>("")

const onSend = () => {
    const playerUUID = uuidv4()
    userStore.uuid = playerUUID
    socket.value?.emit('player', { uuid: playerUUID, name: playerName.value, hand: [], status: Status.ALIVE })
}

onMounted(() => {
    socket.value = io('/play', { path: '/api/socket.io' })

    socket.value.on('players', (playersList: Player[]) => {
        userStore.players = playersList; 
    });
})
</script>

  