<template>
    GameID : {{ id }}
</template>
  
<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const id = route.params.id as string;
</script>
