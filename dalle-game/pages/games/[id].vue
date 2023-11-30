<template>
  <!-- isGameNotFoundがtrueの場合にエラーメッセージを表示 -->
  <div v-if="isGameNotFound">
    <div class="text-red-600 text-xl text-center mt6">エラー: ゲームが見つかりませんでした。</div>
  </div>
  <div v-else>
    <UCard>
      <template #header>
        <Placeholder class="h-8" />
        <div>
          GameID : {{ id }}：<UButton icon="i-heroicons-clipboard-document" color="gray" @click="copyToClipboard">Game ROOM URLをコピー</UButton>
        </div>
      </template>

        <div>
          <UInput v-model="imageUrl" />
          <UButton @click="createTitle" :disabled="titleFixed">取得</UButton>
          <div class="text-red-600 text-xl text-center mt6">{{ imageGetError }}</div>
        </div>
        <div class="text-center">
          <img :src="titleImgBase64" width="256" height="256" />
        </div>
        <div class="text-center">
          <UButton @click="fixTitle" :disabled="titleFixed">お題を確定</UButton>
        </div>

    </UCard>

    <UButton @click="result" :disabled="!roomClosed">結果を表示</UButton>
 
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
const titleImgBase64 = ref<string>('');
const titleFixed = ref<boolean>(false);
const roomClosed = ref<boolean>(false);

const prompt = ref<string>('');
const genImage = ref<string>('');
const nickname = ref<string>('');

const isGameNotFound = ref<boolean>(false);

const imageGetError = ref<string>('');

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
  imageUrl.value = room.titleUrl;
  titleImg.value = room.titleImage;
  titleImgBase64.value = room.titleImage? `data:image/png;base64,${room.titleImage}`:'';
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
  // 画像URLが空の場合は何もしない
  if(!imageUrl.value) return;

  //画像を取得する
  const { data, error } = await useFetch(`/api/images?url=${encodeURIComponent(imageUrl.value)}`, {
    method: 'GET',
  });
  if(error.value) {
    console.error(error.value);
    imageGetError.value = '画像の取得に失敗しました。';
    return;
  }
  const image = data.value;
  titleImg.value = image?.image;
  titleImgBase64.value = `data:image/png;base64,${image?.image}`;
  imageGetError.value = '';
}

const fixTitle = async () => {
  const { data, error } = await useFetch(`/api/games/title`, {
    method: 'POST',
    body: JSON.stringify({
      roomId: id,
      titleUrl: imageUrl.value,
      titleImage: titleImg.value,
    }),
  });
  if(error.value) {
    console.error(error.value);
    return;
  }
  titleFixed.value = true;
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
