<template>
    <div>
        <h1>Result</h1>
        <p>id: {{ id }}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Image</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) in items" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ item.title }}</td>
          <td><img :src="item.imageUrl" alt="" width="100"></td>
          <td>{{ item.date }}</td>
        </tr>
      </tbody>
    </table>
    <div>
        <UButton @click="createGame">New Game!</UButton>
        <UButton @click="back">戻る</UButton>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';

const route = useRoute();
const id = route.params.id;

const createGame = async () => {
    navigateTo('/games/457975');
};

const back = async () => {
    navigateTo('/games/'+id);
}
  // この部分は静的なデータの例ですが、実際にはAPIから取得したデータを使用します。
  const items = ref([
    {
      title: 'Item 1',
      imageUrl: 'https://via.placeholder.com/150',
      date: '2023-01-01'
    },
    {
      title: 'Item 2',
      imageUrl: 'https://via.placeholder.com/150',
      date: '2023-01-02'
    },
    {
      title: 'Item 3',
      imageUrl: 'https://via.placeholder.com/150',
      date: '2023-01-03'
    }
  ]);
  
  // APIからデータをフェッチする場合は以下のようになります。
  // onMounted(async () => {
  //   const response = await fetch('/api/data');
  //   items.value = await response.json();
  // });

  
  </script>
  
  <style>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
  
  th {
    background-color: #f2f2f2;
  }
  
  img {
    width: 50px;
    height: auto;
  }
  </style>
  