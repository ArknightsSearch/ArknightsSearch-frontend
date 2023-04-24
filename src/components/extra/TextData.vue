<script setup>
const props = defineProps(['data'])

</script>

<template>
    <div style="margin: 13px 0;">
        <p style="position: relative; left: -2%; margin: 5px 0"><small><strong>文本：{{props.data.raw}}</strong></small></p>
        <p v-if="props.data.data[0]" style="">{{ props.data.data[0] }}</p>
        <p style="margin: 0">{{ props.data.data[1] }}<b>{{ props.data.data[2] }}</b>{{ props.data.data[3] }}</p>
        <p v-if="props.data.data[4]" style="">{{ props.data.data[4] }}</p>
    </div>
</template>

<style scoped>
p {
    margin: 2px 0;
}
</style>
