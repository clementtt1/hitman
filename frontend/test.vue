<template>
    <div class="relative w-full max-w-4xl">
      <div class="relative flex flex-col-reverse h-[calc(100vh_-_4em)] overflow-y">
        <div v-for="(chat, i) in chats" class="relative flex mb-3" :class="chat.itsMe ? 'justify-end pr-10' : 'pl-10'" :key="i">
          <div class="inline-flex border rounded-t-lg px-3 py-2" :class="chat.itsMe ? 'border-green-500' : 'border-blue-500'">
            {{ chat.content }}
          </div>
        </div>
      </div>
      <div class="flex items-center py-2 rounded-lg bg-gray-50 dark:bg-gray-700">
          <button type="button" class="p-2 text-gray-500 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
              <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.408 7.5h.01m-6.876 0h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM4.6 11a5.5 5.5 0 0 0 10.81 0H4.6Z"/>
              </svg>
              <span class="sr-only">Add emoji</span>
          </button>
          <textarea v-model="message" rows="1" class="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Your message..."></textarea>
              <button type="submit" class="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600" @click="onSend">
              <svg class="w-5 h-5 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                  <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
              </svg>
              <span class="sr-only">Send message</span>
          </button>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { io, type Socket } from 'socket.io-client'
  
  interface Chat {
    content: string
    itsMe: boolean
  }
  
  const message = ref('')
  const chats = ref<Chat[]>([])
  const socket = ref<Socket>()
  
  function onSend(){
    socket.value?.emit('chat', message.value)
  
    chats.value.unshift({
      itsMe: true,
      content: message.value
    })
  
    nextTick(() => (message.value = ''))
  
    console.log(chats.value)
  }
  
  onMounted(() => {
    socket.value = io ('/chat', {
      path: '/api/socket.io'
    })
  
    socket.value.on('chat', (response: Record<'id' | 'text', string>) => {
      if(socket.value?.id === response.id) {
        return
      }
  
      chats.value.unshift({ content: response.text, itsMe: false })
    })
  
  })
  
  onBeforeUnmount(() => {
    socket.value?.disconnect()
  })
  
  
  </script>