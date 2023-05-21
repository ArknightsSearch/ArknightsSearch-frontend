<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import ParamItem from './ParamItem.vue'
import { params, fetchData, getParams } from '@/lib/params'
import message from '@/lib/message'

const ids = ref([])
params.value.forEach((e) => {
    ids.value.push(Date.now() + '')
})

const route = useRoute()

function createParam () {
    params.value.push({})
    ids.value.push(Date.now())
    syncParams()
}

function deleteParam (index) {
    if (params.value.length === 1) {
        clearParam()
        return
    }
    params.value.splice(index, 1)
    ids.value.splice(index, 1)
    syncParams()
}

function clearParam () {
    message.confirm('是否重置', '提示', () => {
        params.value = [{}]
        ids.value = [Date.now()]
        syncParams()
    })
}

onMounted(() => {
    if (params.value.length === 0) {
        if (Object.prototype.hasOwnProperty.call(route.query, 'params')) {
            try {
                params.value = JSON.parse(route.query.params)
            } catch (e) {

            }
        }
        if (typeof params !== 'object' || params.value.length === 0) {
            params.value = [{}]
        } else {
            fetchData()
        }
    }
})

function syncParams () {
    router.push({ path: '/input', query: { params: JSON.stringify(params.value) } })
    fetchData()
}

function toSearch () {
    getParams((data) => {
        if (data.length < 1) {
            message.notify('请至少输入一个有效筛选', message.warning)
            return
        }
        router.push({ path: '/search', query: route.query })
    })
}
</script>

<template>
    <div style="width: 100%; height: 20px"></div>
    <ParamItem v-model="params[index]" :key="ids[index]" :index="index" style="margin-top: 10px"
               @create="createParam" @delete="deleteParam" @edit="syncParams"
               v-for="(param, index) in params" :create="index===params.length-1"

    />
    <div style="width: 100%; display: flex; justify-content: right; margin-top: 20px">
        <el-button style="width: min(120px, 25%)" @click="clearParam">重置</el-button>
        <el-button style="width: min(120px, 25%)" @click="createParam">添加</el-button>
        <el-button style="width: min(120px, 25%)" @click="toSearch">搜索</el-button>
    </div>
</template>
