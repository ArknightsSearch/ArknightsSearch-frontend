<script setup>
import { ref, computed } from 'vue'
import { dataCache, api } from '@/lib/params'

const props = defineProps({
    create: {
        type: Boolean,
        default: false
    },
    modelValue: {
        type: Object
    },
    index: {
        type: Number,
        default: -1
    }
})
const emit = defineEmits(['update:modelValue', 'delete', 'edit'])

const SelectType = {
    text: '文本',
    char: '角色',
    zone: '活动',
    regex: '正则'
}

const param = computed({
    get () {
        return props.modelValue
    },
    set (value) {
        emit('update:modelValue', value)
    }
})

const optionList = ref([])
const optionInput = ref('')

function fetchOption (event) {
    optionInput.value = event.target.value
    if (!event.target.value) {
        optionList.value = []
        return
    }
    api.cancel()
    if (param.value.type === 'zone') {
        api.get({
            url: 'alias/search',
            data: {
                text: event.target.value,
                type: 64,
                lang: 1,
                output: 6,
                mode: 14,
                include_origin: true
            },
            success (resp) {
                const data = []
                resp.data.forEach((item) => {
                    if (item[0].indexOf('复刻') !== -1 || item[0].indexOf('签到') !== -1 ||
              item[0].indexOf('活动') !== -1 || item[0].indexOf('登录') !== -1) {
                        return
                    }
                    dataCache[item[0]] = item[1]
                    data.push(item[0])
                })
                optionList.value = data.length > 100 ? data.slice(0, 100) : data
            }
        })
    } else if (param.value.type === 'char') {
        api.get({
            url: 'npc/search',
            data: {
                text: event.target.value,
                lang: 1,
                output: 2,
                mode: 14
            },
            success (resp) {
                optionList.value = resp.data.length > 100 ? resp.data.slice(0, 100) : resp.data
            }
        })
    }
}

function autoSelect () {
    if (optionInput.value === optionList.value[0] && param.value.value !== optionInput.value) {
        param.value.value = optionInput.value
        emit('edit')
    }
}

</script>

<template>
  <div>
    <div style="width: 100%; display: flex">
      <el-select v-model="param.type" style="width: 80px; flex-shrink: 0" class="item-left"
                 placeholder="类型" @change="param.value=null; fakeValue=null; optionList=[]; $emit('edit')">
        <el-option
            v-for="(label,key) in SelectType"
            :key="key"
            :label="label"
            :value="key"
        />
      </el-select>
      <template v-if="!param.type">
        <el-input style="flex-grow: 1" class="item-center" disabled placeholder="请选择类型"></el-input>
      </template>
      <template v-else-if="param.type === 'text' || param.type === 'regex'">
        <el-input style="flex-grow: 1" class="item-center" v-model="param.value"
                  @change="$emit('edit')"></el-input>
      </template>
      <template v-else-if="param.type==='zone' || param.type==='char'">
        <el-select style="flex-grow: 1" class="item-center" placeholder="输入名称以搜索" v-model="param.value"
                   filterable remote @input="fetchOption" :filter-method="(p) => {}" @change="$emit('edit')"
                   @blur="autoSelect">
          <el-option
              v-for="option in optionList"
              :key="option"
              :label="option"
              :value="option"
          />
        </el-select>
      </template>
      <el-button class="item-right" style="padding: 8px 10px" @click="$emit('delete',index)">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" data-v-ea893728="" style="width: 16px">
          <path fill="currentColor"
                d="M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"></path>
        </svg>
      </el-button>
    </div>
    <el-alert v-if="param.type==='char' && props.create" class="alert" type="warning" center>
      注意：目前仅支持搜索在剧情里出现过的名字
    </el-alert>
    <el-alert v-if="!param.value && !props.create" class="alert" type="error" center>
      此筛选无效
    </el-alert>
  </div>
</template>

<style>
.item-left .el-input__wrapper {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  position: relative;
  left: 1px;
  background: #f5f7fa;
}

.item-left .is-focus.el-input__wrapper,
.item-center .is-focus.el-input__wrapper,
.item-left .el-input__wrapper:hover,
.item-center .el-input__wrapper:hover {
  z-index: 1;
}

.item-center .el-input__wrapper {
  border-radius: 0;
}

.item-right {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  position: relative;
  left: -1px;
  background: #f5f7fa;
  color: dimgray;
}

</style>
<style scoped>
.alert {
  width: 100%;
}
</style>
