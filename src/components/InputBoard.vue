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
    if (params.value.length >= 20) {
        message.notify('目前最大支持20条参数，请缩减参数数量', message.warning)
        return
    }
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
    params.value = [{}]
    ids.value = [Date.now()]
    syncParams()
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
    <el-button style="width: min(120px, 25%)" @click="message.confirm('是否重置', '提示', clearParam)">重置
    </el-button>
    <el-button style="width: min(120px, 25%)" @click="createParam">添加</el-button>
    <el-button style="width: min(120px, 25%)" @click="toSearch">搜索</el-button>
  </div>
  <div style="width: 100%; margin-top: 20px; display: flex; justify-content: center">
    <div style="width: 95%">
      <!--      <el-collapse>-->
      <!--        <el-collapse-item>-->
      <!--          <template #title>-->
      <!--            我不是公告，别点我-->
      <!--          </template>-->
      <el-divider/>
      <h2>ArkSearch</h2>
      <p>本项目仍处于开发状态，如有建议欢迎入交流群反馈</p>
      <p style="display: flex; align-items: center">如遇到角色名称错误，可填写
        <el-link href="https://wj.qq.com/s2/12441816/47cc/" target="_blank">此问卷</el-link>
      </p>
      <div style="display: flex; margin-top: 10px">
        <el-link href="https://jq.qq.com/?_wv=1027&k=ImatbCzG" style="margin-right: 5px"
                 target="_blank">
          交流群：560295639
        </el-link>
        <span style="border-left: solid 1px darkgrey"></span>
        <el-link href="https://github.com/ArknightsSearch/ArknightsSearch-backend" style="margin: 0 5px;"
                 target="_blank">
          GitHub
        </el-link>
      </div>
      <!--        </el-collapse-item>-->
      <!--      </el-collapse>-->
    </div>

  </div>
</template>
