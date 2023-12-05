<template>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
    roomId:{{ room?.roomId }}<br /> 
    createDateTime:{{ room?.createDateTime }}<br />
    titleFixed:{{ room?.titleFixed }}<br />
    roomClosed:{{ room?.roomClosed }}<br />
    titleUrl:{{ room?.titleUrl }}<br />
    titleImage:<img :src="'data:image/png;base64,' + room?.titleImage" width="256" height="256" /><br />
    <hr />
    <input type="button" value="refresh" @click="refresh" />
    <br />
    <input type="button" value="execute" @click="execute" />
    <br />
    <input type="button" value="execute2" @click="execute2" />
</div>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import type { Room } from '~/types/room';

const route = useRoute();
const id = route.params.id as string;
const { data: room, pending, refresh, execute, error } = await useLazyFetch<Room>(`/api/games/${id}`);
// if (!room.value || error.value) {
//     throw createError({statusCode: 404, message: 'Room not found',})
// }
const execute2 = async () => {
    // const { data } = await useLazyFetch<Room>(`/api/games/${id}`);
    // if(room) room.value = data.value;
    execute();
}
</script>