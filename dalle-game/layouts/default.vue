<template>
<div class="flex flex-col h-screen">
    <header class="flex justify-between items-center bg-gray-200 p-4 sticky top-0 z-10">
        <h1 class="text-lg font-bold">DALLE-GAME!</h1>
        <NewGame />
    </header>
    <div class="flex-1 overflow-auto">
        <!-- contents start-->
        <slot />
        <!-- contents end-->
    </div>
</div>
</template>

<script setup lang="ts">
import NewGame from '~/components/NewGame.vue';
</script>