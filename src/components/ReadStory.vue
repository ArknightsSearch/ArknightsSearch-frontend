<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import Requests from '@/lib/requests'
import { StoryApi } from '@/lib/constant'
import { getParams } from '@/lib/params'

const api = new Requests({
    host: StoryApi
})
const route = useRoute()

const searched = ref(false)
const errorStatus = ref(false)
const errorResponse = ref(0)

function goBack () {
    const params = route.query
    delete params.id
    router.push({ path: '/search', query: params })
}

const text = ref(null)
const title = ref(null)
const loading = ref(true)

function parseText (data) {
    const result = []
    data.split('\n').forEach((g) => {
        const r = g.split(':', 2)
        if (r.length === 1) {
            result.push(['', r[0]])
        } else {
            result.push(r)
        }
    })
    return result
}

onMounted(() => {
    getParams((params) => {
        api.get({
            url: 'story/read',
            data: {
                id: route.query.id,
                lang: 'zh_CN'
            },
            success (resp) {
                title.value = resp.data[0]
                text.value = parseText(resp.data[1])
                searched.value = true
                errorStatus.value = false
            },
            error (resp) {
                searched.value = false
                errorStatus.value = resp.code + ' ' + resp.request.status
                errorResponse.value = resp
            }
        })
    })
})
</script>

<template>
    <div style="display: flex; margin: 20px 0">
        <h2 style="display: flex; align-items: center; cursor: pointer; margin: 0" @click="goBack">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728=""
                 style="width: 25px; margin-right: 5px">
                <path fill="currentColor" d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64z"></path>
                <path fill="currentColor"
                      d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"></path>
            </svg>
            返回
        </h2>
    </div>

    <div v-if="errorStatus" style="display: flex; align-items: center; flex-flow: column; color: dimgrey">
        <el-divider/>
        <h2 v-if="errorResponse.response.status===429">请求太快啦，慢一点吧</h2>
        <h2 v-if="errorResponse.response.status===404">不存在该剧情</h2>
        <h2 v-else-if="errorResponse.response.status>=500">呜，服务器崩溃了</h2>
        <h2 v-else-if="errorResponse.response.status>=400">请求失败，换个方式吧</h2>
        <h2 v-else>未知错误</h2>
        <p>Code: {{ errorStatus }}</p>
        <p style="cursor:pointer;" @click="search">点我重新加载</p>
    </div>
    <div v-else-if="searched" style="display: flex; justify-content: center; width: 100%; flex-wrap: wrap">
        <h2 style="width: 100%; text-align: center">{{ title }}</h2>
        <div v-for="(data,index) in text" style="width: 100%; display: flex; margin: 4px 0" :key="index">
            <div style="min-width: 100px; text-align: right; color: gray; margin-right: 10px">{{ data[0] }}</div>
            <div>{{ data[1] }}</div>
        </div>
    </div>
   <div v-else>
    <div v-loading="loading" style="width: 100%; height: 300px">
    </div>
  </div>
</template>

<style scoped>

</style>
