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
          <div class="text-2xl text-center">画像生成ゲーム</div>
          <div class="text-center">結果一覧</div>
        </div>
      </template>
      <div>
        <div v-if="titleImage === ''">
          <img class="m-auto" src="/noimage.png" width="256" height="256" />
        </div>
        <div v-else>
          <img class="m-auto" :src="'data:image/png;base64,' + titleImage" width="256" height="256" />
        </div>
        <table class="w-full">
          <thead>
            <tr>
              <th class="border border-slate-300 bg-slate-200">順位</th>
              <th class="border border-slate-300 bg-slate-200">ニックネーム</th>
              <th class="border border-slate-300 bg-slate-200">類似度</th>
              <th class="border border-slate-300 bg-slate-200">画像</th>
              <th class="border border-slate-300 bg-slate-200">DALL-E</th>
              <th class="border border-slate-300 bg-slate-200">プロンプト</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td class="border border-slate-300 text-center">{{ index + 1 }}</td>
              <td class="border border-slate-300">{{ item.nickname }}</td>
              <td class="border border-slate-300 text-center">{{ item.similarity }}</td>
              <td class="border border-slate-300 text-center"><img class="m-auto" :src="'data:image/png;base64,'+ item.image" width="256"></td>
              <td class="border border-slate-300">{{ item.dalle }}</td>
              <td class="border border-slate-300">{{ item.prompt }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id;

const titleImage = ref<string>(); // タイトル画像

const isGameNotFound = ref<boolean>(false); // ゲームが見つからなかったかどうか
const items = ref<any[]>([]); // 結果一覧

// コンポーネントがマウントされたときに実行
onMounted(async () => {
  // ゲームの情報を取得
  const { data, error } = await useFetch(`/api/games/${id}`);
  if (error.value) {
    console.error(error.value);
    isGameNotFound.value = true;
    return;
  }
  const room = data.value as import('~/types/room').Room;
  titleImage.value = room.titleImage;
  // ゲーム結果を取得
  const { data: resultData, error: resultError } = await useFetch(`/api/result/${id}`);
  if (resultError.value) {
    console.error(resultError.value);
    return;
  }
  items.value = resultData.value as any[];
});

</script>
