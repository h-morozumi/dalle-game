<template>
<div>
    <UButton @click="createGame">New Game!</UButton>
</div>
</template>

<script setup lang="ts">
const createGame = async () => {
  const { data } = await useFetch('/api/rooms', {
    method: 'post',
  });
  const room = data.value as Room;
  // Gameへ画面遷移
  navigateTo(`/games/${room.roomId}`)
}

interface Room {
  roomId: String;
}
</script>

