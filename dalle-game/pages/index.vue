<template>
    <UCard>
      <template #header>
        <Placeholder class="h-8" />
        DALL-E Game
      </template>
  
      <Placeholder class="h-32" />
      <UButton @click="createGame">New Game!</UButton>
    </UCard>
</template>

<script setup>
const createGame = () => {
  navigateTo('/games/11467')
}
</script>