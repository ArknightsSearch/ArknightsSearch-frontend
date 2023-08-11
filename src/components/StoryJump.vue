<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import Requests from '@/lib/requests'
import { StoryApi } from '@/lib/constant'
import message from '@/lib/message'

const api = new Requests({
    host: StoryApi
})
const route = useRoute()

const ifShow = ref(false)
const storyInfo = ref({})

const StoryJumpUrl = {
    local: '/story/read',
    astr: 'https://050644zf.github.io/ArknightsStoryTextReader/#/zh_CN/content?f=',
    prts: 'https://prts.wiki/w/'
}

const disableType = {
    local: [],
    astr: [
        'Rogue'
    ],
    prts: [
        'Rogue'
    ]
}

function show (info) {
    storyInfo.value = info
    ifShow.value = true
}

function jump (target) {
    if (target === 'local') {
        router.push({
            path: '/story/read',
            query: {
                ...route.query,
                id: storyInfo.value.id
            }
        })
    } else if (target === 'astr') {
        location.href = StoryJumpUrl.astr + storyInfo.value.id
    } else if (target === 'prts') {
        const g = storyInfo.value.id.split('/')
        const ng = g[g.length - 1].split('_')
        if (storyInfo.value.type === 'Memory') {
            if (ng[ng.length - 1] !== '1') {
                location.href = StoryJumpUrl.prts + storyInfo.value.zone + '/干员密录/' + ng[ng.length - 2] + '-' + ng[ng.length - 1]
            } else {
                api.post({
                    url: 'story/multiple_memory',
                    data: {
                        id: storyInfo.value.id
                    },
                    success (resp) {
                        if (resp.data) {
                            location.href = StoryJumpUrl.prts + storyInfo.value.zone + '/干员密录/' + ng[ng.length - 2] + '-1'
                        } else {
                            location.href = StoryJumpUrl.prts + storyInfo.value.zone + '/干员密录/' + ng[ng.length - 2]
                        }
                    }
                })
            }
        } else if (storyInfo.value.type === 'Main' || storyInfo.value.type === 'Activity') {
            const n2g = storyInfo.value.name.split(' ')
            if (ng.indexOf('st') !== -1 || ng.indexOf('spst') !== -1) {
                location.href = StoryJumpUrl.prts + n2g.join('_') + '/NBT'
            } else if (ng.indexOf('beg') !== -1) {
                location.href = StoryJumpUrl.prts + n2g.slice(0, n2g.length - 1).join('_') + '/BEG'
            } else if (ng.indexOf('end') !== -1) {
                location.href = StoryJumpUrl.prts + n2g.slice(0, n2g.length - 1).join('_') + '/END'
            } else {
                for (const i in ng) {
                    if (ng[i].startsWith('st')) {
                        location.href = StoryJumpUrl.prts + n2g.join('_') + '/NBT'
                        return
                    }
                }
                message.notify('无法自动连接至PRTS，请手动查询 :(')
            }
        } else {
            message.notify('无法自动连接至PRTS，请手动查询 :(')
        }
    }
}

defineExpose({
    show
})
</script>

<template>
    <el-dialog v-model="ifShow" :title="storyInfo.name" :width="350">
        <div style="column-gap: 4px; display: flex">
            <div class="block" @click="jump('local')">
                <h2>本站</h2>
                <p>纯文本</p>
            </div>
            <div class="block" @click="jump('astr')" v-if="disableType.astr.indexOf(storyInfo.type) === -1">
                <h2>ASTR</h2>
                <p>有图</p>
            </div>
            <div class="block" @click="jump('prts')" v-if="disableType.astr.indexOf(storyInfo.type) === -1">
                <h2>PRTS</h2>
                <p>原生</p>
            </div>
        </div>
        <p style="text-align: center">Tips：ASTR & PRTS转跳如出现问题请反馈</p>
    </el-dialog>
</template>

<style>
.el-dialog__body {
    padding: 10px;
}

.block {
    width: 100%;
    height: 120px;
    margin: 5px;
    border: gray solid 1px;
    border-radius: 15px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    flex-flow: column;
}

.block p {
    margin: 0;
}

.block h2 {
    margin: 0 0 10px 0;
}
</style>
