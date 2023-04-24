import { ref } from 'vue'
import Requests from '@/lib/requests'
import { NameApi } from './constant'

const api = new Requests({
    host: NameApi
})

const params = ref([])

const dataCache = {
    zone: {},
    char: {}
}

function fetchZoneData (name, cb) {
    if (Object.prototype.hasOwnProperty.call(dataCache.zone, name)) {
        cb && cb()
        return
    }

    api.get({
        url: 'name/search',
        data: {
            text: name,
            type: 64,
            lang: 1,
            output: 4,
            mode: 4
        },
        success (resp) {
            dataCache.zone[name] = resp.data[0]
            cb && cb()
        }
    })
}

function fetchCharData (name, cb) {
    if (Object.prototype.hasOwnProperty.call(dataCache.char, name)) {
        cb && cb()
        return
    }

    api.get({
        url: 'npc/search',
        data: {
            text: name,
            lang: 1,
            output: 4,
            mode: 4
        },
        success (resp) {
            dataCache.char[name] = resp.data
            cb && cb()
        }
    })
}

const fetchDict = {
    zone: fetchZoneData,
    char: fetchCharData
}

function fetchData (cb) {
    const needFetch = []
    params.value.forEach((param) => {
        if (!param.value) {
            return
        }

        if (!Object.prototype.hasOwnProperty.call(dataCache, param.type)) {
            return
        }

        if (Object.prototype.hasOwnProperty.call(dataCache[param.type], param.value)) {
            return
        }
        if (cb) {
            needFetch.push(param)
        } else {
            fetchDict[param.type](param.value)
        }
    })
    if (cb) {
        let last = needFetch.length
        if (last === 0) {
            cb()
            return
        }
        needFetch.forEach((param) => {
            fetchDict[param.type](param.value, () => {
                if (--last === 0) {
                    cb()
                }
            })
        })
    }
}

function getParams (cb) {
    fetchData(() => {
        const data = []
        params.value.forEach((param) => {
            if (!param.value) {
                return
            }
            if (Object.prototype.hasOwnProperty.call(dataCache, param.type)) {
                data.push({
                    type: param.type,
                    param: dataCache[param.type][param.value],
                    raw: param.value
                })
            } else {
                data.push({
                    type: param.type,
                    param: param.value
                })
            }
        })
        cb && cb(data)
    })
}

export {
    api,
    dataCache,
    params,
    fetchZoneData,
    fetchCharData,
    fetchData,
    getParams
}
