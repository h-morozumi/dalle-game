<template>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else>
    roomId:{{ data[0]?._id }}<br />
    roomId:{{ data[1]?.[0]?._id }}<br />
    </div>
    <hr />
    <input type="button" value="refresh" @click="refresh" />
    <br />
    <input type="button" value="execute" @click="execute" />
    <br />
</template>
<script lang="ts" setup>
const { data, pending, error, refresh, execute } = await useAsyncData(
    'getMountainsAndRivers',
    async () => {
        return await Promise.all([
            $fetch('/api/games/1ee92784-6d4d-6c30-38ac-aedffec0905f'),
            $fetch('/api/result/1ee92784-6d4d-6c30-38ac-aedffec0905f')
        ])
    }
)
</script>