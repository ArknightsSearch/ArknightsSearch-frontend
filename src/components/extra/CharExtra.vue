<script setup>
const props = defineProps(['data'])

</script>

<template>
    <div style="margin: 13px 0">
        <p style="position: relative; left: -2%; margin: 5px 0"><small><strong>角色：{{props.data.raw}}</strong></small></p>
        <p v-for="(text, index) in props.data.data" :key="index">{{ text }}</p>
        <p v-if="props.data.has_more">...</p>
    </div>
</template>

<style scoped>
p {
    margin: 1px 0;
}
</style>
