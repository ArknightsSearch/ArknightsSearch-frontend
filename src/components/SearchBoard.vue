<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import StoryJump from '@/components/StoryJump.vue'
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
const errorResponse = ref(0)
const loading = ref(true)

const storyJumpRef = ref(null)

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

function formatResult (data) {
    const result = []
    data.forEach((i) => {
        result.push({
            id: i[0],
            type: i[1],
            name: i[2],
            zone: i[3],
            extra: i[4]
        })
    })
    return result
}

function search () {
    searched.value = false
    loading.value = true
    const startTime = Date.now()
    getParams((params) => {
        api.post({
            url: 'story',
            data: {
                params,
                offset: offset.value,
                limit: pageSize,
                require: 403
            },
            success (resp) {
                const diff = Date.now() - startTime
                if (diff < 500) {
                    setTimeout(() => {
                        result.value = formatResult(resp.data.data)
                        total.value = resp.data.total
                        pageNum.value = Math.ceil(resp.data.total / pageSize) || 1
                        searched.value = true
                        errorStatus.value = false
                        loading.value = false
                    }, 500 - diff)
                } else {
                    result.value = formatResult(resp.data.data)
                    total.value = resp.data.total
                    pageNum.value = Math.ceil(resp.data.total / pageSize) || 1
                    searched.value = true
                    errorStatus.value = false
                    loading.value = false
                }
            },
            error (resp) {
                total.value = 0
                searched.value = false
                errorStatus.value = resp.code + ' ' + resp.request.status
                errorResponse.value = resp
                loading.value = false
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
  <StoryJump ref="storyJumpRef"/>
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
    <template v-if="errorResponse.response.status===440">
      <h2>正则表达式语法错误</h2>
      <p style="margin-top: 0"><i>{{ errorResponse.response.data.detail }}</i></p>
    </template>
    <h2 v-else-if="errorResponse.response.status===429">请求太快啦，慢一点吧</h2>
    <h2 v-else-if="errorResponse.response.status===408">处理超时，试着减少参数吧</h2>
    <h2 v-else-if="errorResponse.response.status>=500">呜，服务器崩溃了</h2>
    <h2 v-else-if="errorResponse.response.status>=400">请求失败，换个方式吧</h2>
    <h2 v-else>未知错误</h2>
    <p>Code: {{ errorStatus }}</p>
    <p style="cursor:pointer;" @click="search">点我重新加载</p>
  </div>
  <div style="width: 100%" v-loading="loading" v-else-if="total">
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
          <div style="display: flex; width: calc(100% - 21px); flex: 0 2 auto">
            <div style="display: flex; width: 70px; justify-content: center; margin: 0; padding: 0 5px; flex: 0 2 auto">
              {{ zoneDict[data.type] }}
            </div>
            |
            <div
                style="display:flex;min-width: 100px;  justify-content: center; margin: 0; padding: 0 5px; flex: 0 2 auto">
              {{ data.zone }}
            </div>
            |
            <div
                style="display: flex; padding: 0 5px 0 15px; flex: 0 1 auto; word-break: keep-all; white-space: nowrap">
              {{ data.name }}
            </div>
          </div>
        </template>
        <div style="display: flex; justify-content: center">
          <div style="width: 90%">
            <template v-if="data.extra.length">
              <component v-for="(extra,index) in data.extra" :is="extraDict[extra.type]"
                         :data="extra" :key="index"/>
            </template>
            <template v-else>
              <div style="display: flex; justify-content: center; align-items: center">
                <h2 style="color: grey">无数据</h2>
              </div>
            </template>
            <div style="width: 100%; display: flex; justify-content: right">
              <el-link type="primary" :underline="false" @click="storyJumpRef.show(data)">阅读全文</el-link>
            </div>
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
  <div v-else>
    <div v-loading="loading" style="width: 100%; height: 400px">
    </div>
  </div>
</template>
