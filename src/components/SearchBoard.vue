<script setup>
import { ref, onMounted, nextTick } from 'vue'
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
        <div style="flex-grow: 1; display: flex; justify-content: right; align-items: end">
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
    <div style="width: 100%">
        <el-collapse>
            <el-collapse-item :key="''+offset+index" v-for="(data,index) in result">
                <template #title>
                    <div style="display: flex; width: 100%">
                        <p style="width: 70px; text-align: center; margin: 0">{{ zoneDict[data.type] }}</p>
                        |
                        <p style="width: 100px; text-align: center; margin: 0">{{ data.zone }}</p>
                        |
                        <p style=" margin: 0 0 0 15px;"> {{ data.name }}</p>
                    </div>
                </template>
                <div style="display: flex; justify-content: center">
                    <div style="width: 90%">
                        <component v-for="(extra,index) in data.data" :is="extraDict[extra.type]"
                                   :data="extra" :key="index"/>
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
</template>
