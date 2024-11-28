<script setup>
defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
</script>

<template>
    <div class="bg-white border-2 border-black rounded-lg shadow-lg w-52 h-72 flex justify-center items-center">
        <span class="mot text-2xl font-bold text-gray-800">
            {{ modelValue }}
        </span>
    </div>
</template>
