<template>
  <!-- isGameNotFoundがtrueの場合にエラーメッセージを表示 -->
  <div v-if="isGameNotFound">
    <div class="text-red-600 text-xl text-center mt6">エラー: ゲームが見つかりませんでした。</div>
  </div>
  <div v-else>
    GameID : {{ id }} : 
    <UButton icon="i-heroicons-clipboard-document" color="gray" @click="copyToClipboard">Game ROOM URLをコピー</UButton>
    <UButton @click="result" :disabled="!roomClosed">結果を表示</UButton>
    <h2>お題</h2>
    <div>
      画像URL：
      <UInput v-model="imageUrl" />
      <UButton @click="createTitle" :disabled="titleFixed">取得</UButton>
    </div>
    <div>
      <img :src="titleImg" width="512" />
    </div>
    <div>
      <UTextarea v-model="prompt" />
      <UButton @click="createImage">画像を生成</UButton>
      <UButton @click="clear">クリア</UButton>
    </div>
    <div>
      <img :src="genImage" />
      ニックネーム：<UInput v-model="nickname" />
      <UButton @click="shareImage">画像を共有</UButton>
    </div>
  </div>

</template>
  
<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';

const route = useRoute();

const id = route.params.id as string;

const imageUrl = ref<string>('');
const titleImg = ref<string>('');
const titleFixed = ref<boolean>(false);
const roomClosed = ref<boolean>(false);

const prompt = ref<string>('');
const genImage = ref<string>('');
const nickname = ref<string>('');

const isGameNotFound = ref<boolean>(false);

// 現在のページの完全なURLを取得
const currentUrl = computed(() => {
  return window.location.origin + route.fullPath;
});

// コンポーネントがマウントされたときに実行
onMounted(async () => {
  // Gameの内容を取得
  const { data, error } = await useFetch(`/api/games/${id}`);
  if (error.value) {
    console.error(error.value);
    isGameNotFound.value = true;
    return;
  }
  const room = data.value as import('~/types/room').Room;
  console.log(room)
  imageUrl.value = room.titleUrl;
  titleImg.value = room.titleImage;
  titleFixed.value = room.titleFixed;
  roomClosed.value = room.roomClosed;
});

// クリップボードに値をコピーする
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

// お題の画像を作成
const createTitle = async () => {
  //画像を取得する
}

const createImage = async () => {
  console.log(prompt.value);
  
}

const shareImage = async () => {
  console.log(nickname.value);
  console.log(genImage.value);
  console.log(prompt.value);
  genImage.value = '';
  prompt.value = '';
}

const clear = async () => {
  genImage.value = '';
  prompt.value = '';
}

const result = async () => {
  navigateTo('/result/' + id);
}

</script>
