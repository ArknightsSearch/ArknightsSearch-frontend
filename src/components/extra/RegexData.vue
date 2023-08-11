<script setup>
const props = defineProps(['data'])
</script>

<template>
  <div style="margin: 13px 0">
    <p style="position: relative; left: -2%; margin: 5px 0">
      <small><strong>正则：{{ props.data.raw }}</strong></small></p>
    <div v-for="(data, index) in props.data.data" :key="index">
      <el-divider style="margin: 10px 0" border-style="dashed" v-if="index!==0"/>
      <p v-if="data[0]" style="">{{ data[0] }}</p>
      <p style="margin: 0">{{ data[1] }}<b>{{ data[2] }}</b>{{ data[3] }}</p>
      <p v-if="data[4]" style="">{{ data[4] }}</p>
    </div>
    <p v-if="props.data.has_more">...</p>
  </div>
</template>

<style scoped>
p {
  margin: 1px 0;
}
</style>
