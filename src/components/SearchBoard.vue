<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import Requests from '@/lib/requests'
import { params, getParams } from '@/lib/params'
import { StoryApi, pageSize } from '@/lib/constant'
import extraDict from './extra'

const route = useRoute()
const api = new Requests({
    host: StoryApi
})
const result = ref([])
const pageNum = ref(1)
const currPage = ref(1)
const offset = ref(0)
const total = ref(0)
const searched = ref(false)
const errorStatus = ref(false)
const errorCode = ref(0)

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
            router.push({ path: '/input' })
        }
    }
    if (Object.prototype.hasOwnProperty.call(route.query, 'offset')) {
        offset.value = +route.query.offset || 0
        currPage.value = Math.ceil(offset.value / pageSize) + 1
    }
    search()
})

function goBack () {
    router.push({ path: '/input', query: { params: route.query.params } })
}

function search () {
    searched.value = false
    getParams((params) => {
        api.post({
            url: 'story',
            data: {
                params,
                offset: offset.value,
                limit: pageSize
            },
            success (resp) {
                result.value = resp.data.data
                total.value = resp.data.total
                pageNum.value = Math.ceil(resp.data.total / pageSize) || 1
                searched.value = true
                errorStatus.value = false
            },
            error (resp) {
                console.log(resp)
                total.value = 0
                searched.value = false
                errorStatus.value = resp.code + ' ' + resp.request.status
                errorCode.value = resp.request.status
            }
        })
    })
}

function setCurrPage (value) {
    currPage.value = value
    router.push({
        query: {
            ...route.query,
            offset: (value - 1) * pageSize
        }
    })
    offset.value = (value - 1) * pageSize
    scrollTo(0, 0)
    search()
}

const zoneDict = {
    Memory: '干员密录',
    Main: '主线',
    Rogue: '集成战略',
    Activity: '活动'
}

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
    <div style="flex-grow: 1; display: flex; justify-content: right; align-items: end" v-if="total">
      <small><strong>
        <template v-if="total - offset === 1">
          第{{ total }}条结果
        </template>
        <template v-else>
          <template v-if="offset + pageSize > total">
            第{{ offset + 1 }}-{{ total }}条结果
          </template>
          <template v-else>
            第{{ offset + 1 }}-{{ offset + pageSize }}条结果
          </template>
        </template>
        ，共{{ total }}条
      </strong></small>

    </div>
  </div>
  <div v-if="errorStatus" style="display: flex; align-items: center; flex-flow: column; color: dimgrey">
    <el-divider/>
    <h2 v-if="errorCode>=500">呜，服务器崩溃了</h2>
    <h2 v-else-if="errorCode===429">请求太快啦，慢一点吧</h2>
    <h2 v-else-if="errorCode>=400">请求失败，换个方式吧</h2>
    <h2 v-else>未知错误</h2>
    <p>Code: {{ errorStatus }}</p>
    <p style="cursor:pointer;" @click="search">点我重新加载</p>
  </div>
  <div style="width: 100%" v-else-if="total">
    <div style="display: flex; justify-content: center">
      <el-pagination
          style="margin-bottom: 10px"
          layout="prev, pager, next"
          :page-count="pageNum"
          :pager-count="7"
          :current-page="currPage"
          @update:current-page="setCurrPage"
          hide-on-single-page
      />
    </div>
    <el-collapse>
      <el-collapse-item :key="''+offset+index" v-for="(data,index) in result">
        <template #title>
          <div style="display: flex; width: 100%">
            <p style="min-width: 70px; text-align: center; margin: 0; padding: 0 5px">{{ zoneDict[data.type] }}</p>
            |
            <p style="min-width: 100px; text-align: center; margin: 0; padding: 0 5px">{{ data.zone }}</p>
            |
            <p style=" margin: 0 0 0 15px;"> {{ data.name }}</p>
          </div>
        </template>
        <div style="display: flex; justify-content: center">
          <div style="width: 90%">
            <template v-if="data.data.length">
              <component v-for="(extra,index) in data.data" :is="extraDict[extra.type]"
                         :data="extra" :key="index"/>
            </template>
            <template v-else>
              <div style="display: flex; justify-content: center; align-items: center">
                <h2 style="color: grey">无数据</h2>
              </div>
            </template>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div style="display: flex; justify-content: center">
      <el-pagination
          style="margin-top: 10px"
          layout="prev, pager, next"
          :page-count="pageNum"
          :pager-count="7"
          :current-page="currPage"
          @update:current-page="setCurrPage"
          hide-on-single-page
      />
    </div>
  </div>
  <div v-else-if="searched" style="display: flex; align-items: center; flex-flow: column; color: dimgrey">
    <el-divider/>
    <h2>无结果</h2>
    <p>换个姿势搜索吧</p>
  </div>
</template>
