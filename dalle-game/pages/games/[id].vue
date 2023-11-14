<template>
    GameID : {{ id }} : <UButton icon="i-heroicons-clipboard-document" color="gray" @click="copyToClipboard">Game ROOM URLをコピー</UButton>
</template>
  
<script lang="ts" setup>
  import { useRoute } from 'vue-router';
  import { ref,computed  } from 'vue';
  
  const route = useRoute();
  const id = route.params.id as string;

  // 現在のページの完全なURLを取得
  const currentUrl = computed(() => {
    return window.location.origin + route.fullPath;
  });
  
  // クリップボードに値をコピーする関数
  const copyToClipboard = async () => {
    if (navigator.clipboard) {
      // Clipboard APIを使用してテキストをクリップボードにコピー
      try {
        await navigator.clipboard.writeText(currentUrl.value);
        console.log('Copied to clipboard');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };
</script>
