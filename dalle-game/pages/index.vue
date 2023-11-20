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

<script setup lang="ts">

import { useRoute } from 'vue-router'

const route = useRoute()
const createGame = async () => {
  const { data } = await useFetch('/api/rooms', {
    method: 'post',
  });
  const room = data.value as Room;
  console.log(`data`, room);
  
  // Gameへ画面遷移
  navigateTo(`/games/${room.roomId}`)
}

// Room の型定義
type Room = {
    roomId: string;
}

</script>
