<template>
  <!-- ゲームが存在しない場合にエラーメッセージを表示 -->
  <div v-if="isGameNotFound">
    <div class="text-red-600 text-xl text-center mt6">エラー: ゲームが見つかりませんでした。</div>
  </div>
  <div v-else>
    <UCard>
      <template #header>
        <Placeholder class="h-8" />
        <div class="border-inherit">
          <div class="text-right"><UButton icon="i-heroicons-clipboard-document" color="gray" @click="copyToClipboard">Game URLをコピー</UButton></div>
          <div class="text-2xl text-center">画像生成ゲーム</div>
          <div class="text-center">ゲームのURLを共有して、友達を招待しよう！</div>
        </div>
      </template>
      <div class="border-inherit">
        <div class="grid grid-cols-9">
          <div class="col-span-8">
            <UInput :disabled="titleFixed" v-model="imageUrl" />
            <div class="text-red-600 text-center mt6">{{ imageGetError }}</div>
          </div>
          <div class="col-span-1 text-center">
            <UButton class="mx-2" @click="createTitle" :disabled="titleFixed || imageUrl ==='' || block">取得</UButton>
          </div>
          <div class="col-span-full text-center">
            <UButton class="m-2" @click="fixTitle" :disabled="titleFixed || roomClosed || titleImg ==='' || block">お題を確定</UButton>
            <UButton class="m-2" @click="finishGame" :disabled="!titleFixed || roomClosed || block" >ゲーム終了</UButton>
            <UButton class="m-2" @click="refresh">最新の情報に更新</UButton>
            <UButton class="m-2" @click="result" :disabled="!roomClosed || block">結果を表示</UButton>
          </div>
        </div>
      </div>
      <div class="bg-slate-20 my-3">
        <div class="grid grid-cols-3 min-hight-256">
          <div class="col-span-1">
            <div class="text-center font-medium">お題の画像</div>
            <div v-if="titleImg !== ''">
              <img class="m-auto" :src="'data:image/png;base64,'+ titleImg" />
            </div>
            <div v-else class="text-center">
              <img class="m-auto opacity-25" src="/noimage.png" width="256" height="256" />
            </div>
          </div>
          <div class="col-span-1">
            <div class="text-center">
              <div class="text-center font-medium">生成された画像</div>
              <div v-if="genImage !== ''">
                <img class="m-auto max-height-256" :src="genImage" />
              </div>
              <div v-else>
                <img class="m-auto opacity-25" src="/noimage.png" width="256" height="256" />
              </div>
            </div>
          </div>
          <div class="col-span-1">
            <div class="text-center font-medium">プロンプト</div>
            <div>
              <UTextarea autoresize :rows="12" v-model="prompt" />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 min-hight-200">
          <div class="col-span-1"></div>
          <div class="col-span-1 text-center">
            <UInput v-model="nickname" placeholder="ニックネーム" />
            <UButton class="m-2" @click="shareImage" :disabled="roomClosed || !titleFixed || block">画像を共有</UButton>
          </div>
          <div class="col-span-1">
            <div class="text-center">
              <URadioGroup class="m-auto" v-model="selected" legend="Choose version" :options="options" />
              <UButton class="m-2" @click="createImage" :disabled="roomClosed || !titleFixed || prompt === '' || block">画像を生成</UButton>
              <UButton class="m-2" @click="clear" :disabled="roomClosed || !titleFixed || block">クリア</UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
  
<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref, computed, onMounted } from 'vue';

const route = useRoute();
const id = route.params.id as string;

// Game設定
const titleFixed = ref<boolean>(false); // お題が確定したかどうか
const roomClosed = ref<boolean>(false); // ゲームが終了したかどうか
const imageUrl = ref<string>(''); // お題のURL
const titleImg = ref<string>(''); // お題の画像(バイナリ)
// const titleImgBase64 = ref<string>(''); // お題の画像のBase64データエンコード
const imageGetError = ref<string>(''); // お題の画像の取得エラー
const isGameNotFound = ref<boolean>(false); // ゲームが見つからなかったかどうか

// Gameプレイ
const prompt = ref<string>(''); // プロンプト
const genImage = ref<string>(''); // 生成された画像
const nickname = ref<string>(''); // ニックネーム
const block = ref<boolean>(false); // ブロック
const options = [{
    value: 'v2',
    label: 'DALL-E v2'
  }, {
    value: 'v3',
    label: 'DALL-E v3'
  }]
const selected = ref('v2')
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
  imageUrl.value = room.titleUrl || '';
  titleImg.value = room.titleImage || '';
  titleFixed.value = room.titleFixed;
  roomClosed.value = room.roomClosed;
});

// クリップボードにURLをコピーする
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
  block.value = true;

  //画像を取得する
  const { data, error } = await useFetch(`/api/images?url=${encodeURIComponent(imageUrl.value)}`, {
    method: 'GET',
  });
  if(error.value) {
    console.error(error.value);
    imageGetError.value = '画像の取得に失敗しました。';
    block.value = false;
    return;
  }
  const image = data.value;
  titleImg.value = image?.image ||'';
  imageGetError.value = '';
  block.value = false;
}

// お題の確定
const fixTitle = async () => {
  // 画像URLが空の場合は何もしない
  if(!imageUrl.value || !titleImg.value) return;
  block.value = true;
  
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
    block.value = false;
    return;
  }
  titleFixed.value = true;
  block.value = false;
}

// ゲームを終了
const finishGame = async () => {
  block.value = true;
  
  const { data, error } = await useFetch(`/api/games/close`, {
    method: 'POST',
    body: JSON.stringify({
      roomId: id,
    }),
  });
  if(error.value) {
    console.error(error.value);
    block.value = false;
    return;
  }
  roomClosed.value = true;
  block.value = false;
}

//画像を生成
const createImage = async () => {
  // プロンプトが空の場合は何もしない
  if(!prompt.value) return;
  block.value = true;
  // /api/dalle/v2/gen にPOSTリクエストを送信
  const { data, error } = await useFetch(`/api/dalle/${selected.value}/gen`, {
    method: 'POST',
    body: JSON.stringify({
      prompt: prompt.value,
    }),
  });
  if(error.value) {
    console.error(error.value);
    block.value = false;
    return;
  }
  const genUrl = data.value;
  if(!genUrl) {
    console.error('genUrl is empty');
    block.value = false;
    return;
  }
  genImage.value = genUrl;
  block.value = false;
}

// 生成画像をクリア
const clear = async () => {
  genImage.value = '';
  prompt.value = '';
}

// 生成画像を共有
const shareImage = async () => {
  if(!genImage.value) return;
  block.value = true;

  // 生成した画像とプロンプトを登録する
  const { data, error } = await useFetch(`/api/games/image`, {
    method: 'POST',
    body: JSON.stringify({
      roomId: id,
      nickname: nickname.value || 'no name',
      prompt: prompt.value,
      image: genImage.value,
      dalle: selected.value === 'v2' ? 'DALL-E 2' : 'DALL-E 3',
    }),
  });
  if(error.value) {
    console.error(error.value);
  }

  genImage.value = '';
  prompt.value = '';
  block.value = false;
}

const refresh = async () => {
  // Gameの内容を取得
  const { data, error } = await useFetch(`/api/games/${id}`);
  if (error.value) {
    console.error(error.value);
    isGameNotFound.value = true;
    return;
  }
  const room = data.value as import('~/types/room').Room;
  imageUrl.value = room.titleUrl || '';
  titleImg.value = room.titleImage || '';
  titleFixed.value = room.titleFixed;
  roomClosed.value = room.roomClosed;
}

// 結果を表示
const result = async () => {
  navigateTo('/result/' + id);
}

</script>
