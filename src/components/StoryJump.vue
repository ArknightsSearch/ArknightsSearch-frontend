<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import Requests from "@/lib/requests";
import { StoryApi } from "@/lib/constant";
import message from "@/lib/message";
import ExternalLink from "./icons/ExternalLink.vue";

const api = new Requests({
    host: StoryApi,
});
const route = useRoute();

const ifShow = ref(false);
const storyInfo = ref({});

const StoryJumpUrl = {
    local: "/story/read",
    astr: "https://050644zf.github.io/ArknightsStoryTextReader/#/zh_CN/content?f=",
    prts: "https://prts.wiki/w/",
};

const disableType = {
    local: [],
    astr: ["Rogue"],
    prts: ["Rogue"],
};

function show(info) {
    storyInfo.value = info;
    ifShow.value = true;
}

function goto(url) {
    message.notify("定位成功，正在转跳", message.success);
    location.href = url;
}

function gotoInNewWindow(url) {
    message.notify("定位成功，正在转跳（打开新窗口）", message.success);
    window.open(url, "_blank");
}

async function getJumpUrl(target) {
    if (target === "local") {
        return null;
    } else if (target === "astr") {
        return StoryJumpUrl.astr + storyInfo.value.id;
    } else if (target === "prts") {
        const g = storyInfo.value.id.split("/");
        const ng = g[g.length - 1].split("_");
        if (storyInfo.value.type === "Memory") {
            if (ng[ng.length - 1] !== "1") {
                return (
                    StoryJumpUrl.prts +
                    storyInfo.value.zone +
                    "/干员密录/" +
                    ng[ng.length - 2] +
                    "-" +
                    ng[ng.length - 1]
                );
            } else {
                try {
                    const resp = await new Promise((resolve) => {
                        api.post({
                            url: "story/multiple_memory",
                            data: {
                                id: storyInfo.value.id,
                            },
                            success: resolve,
                        });
                    });
                    if (resp.data) {
                        return (
                            StoryJumpUrl.prts +
                            storyInfo.value.zone +
                            "/干员密录/" +
                            ng[ng.length - 2] +
                            "-1"
                        );
                    } else {
                        return (
                            StoryJumpUrl.prts +
                            storyInfo.value.zone +
                            "/干员密录/" +
                            ng[ng.length - 2]
                        );
                    }
                } catch (e) {
                    message.notify("无法自动连接至PRTS，请手动查询 :(");
                }
            }
        } else if (
            storyInfo.value.type === "Main" ||
            storyInfo.value.type === "Activity"
        ) {
            const n2g = storyInfo.value.name.split(" ");
            if (ng.indexOf("st") !== -1 || ng.indexOf("spst") !== -1) {
                return StoryJumpUrl.prts + n2g.join("_") + "/NBT";
            } else if (ng.indexOf("beg") !== -1) {
                return (
                    StoryJumpUrl.prts +
                    n2g.slice(0, n2g.length - 1).join("_") +
                    "/BEG"
                );
            } else if (ng.indexOf("end") !== -1) {
                return (
                    StoryJumpUrl.prts +
                    n2g.slice(0, n2g.length - 1).join("_") +
                    "/END"
                );
            } else {
                for (const i in ng) {
                    if (ng[i].startsWith("st")) {
                        return StoryJumpUrl.prts + n2g.join("_") + "/NBT";
                    }
                }
                message.notify("无法自动连接至PRTS，请手动查询 :(");
            }
        } else {
            message.notify("无法自动连接至PRTS，请手动查询 :(");
        }
    }

    // 没能找到
    return undefined;
}

async function jump(target) {
    const targetUrl = await getJumpUrl(target);

    if (target === "local") {
        router.push({
            path: "/story/read",
            query: {
                ...route.query,
                id: storyInfo.value.id,
            },
        });
    } else if (targetUrl !== undefined) {
        goto(targetUrl);
    }
}

async function jumpInNewWindow(target) {
    const targetUrl = await getJumpUrl(target);

    if (target === "local") {
        const path = "/story/read";
        const query = { ...route.query, id: storyInfo.value.id };
        const params = new URLSearchParams(query).toString();
        const url = `${window.location.origin}${path}?${params}`;
        gotoInNewWindow(url);
    } else if (targetUrl !== undefined) {
        gotoInNewWindow(targetUrl);
    }
}

defineExpose({
    show,
});
</script>

<template>
    <el-dialog v-model="ifShow" :title="storyInfo.name" :width="350">
        <div style="column-gap: 4px; display: flex">
            <div class="block" @click="jump('local')">
                <h2>本站</h2>
                <p>纯文本</p>
                <br />
                <el-tooltip content="在新窗口中打开链接" placement="top">
                    <el-button
                        class="corner-btn"
                        @click.stop="jumpInNewWindow('local')"
                    >
                        <ExternalLink />
                    </el-button>
                </el-tooltip>
            </div>
            <div
                class="block"
                @click="jump('astr')"
                v-if="disableType.astr.indexOf(storyInfo.type) === -1"
            >
                <h2>ASTR</h2>
                <p>有图</p>
                <br />
                <el-tooltip content="在新窗口中打开链接" placement="top">
                    <el-button
                        class="corner-btn"
                        @click.stop="jumpInNewWindow('astr')"
                    >
                        <ExternalLink />
                    </el-button>
                </el-tooltip>
            </div>
            <div
                class="block"
                @click="jump('prts')"
                v-if="disableType.prts.indexOf(storyInfo.type) === -1"
            >
                <h2>PRTS</h2>
                <p>原生</p>
                <br />
                <el-tooltip content="在新窗口中打开链接" placement="top">
                    <el-button
                        class="corner-btn"
                        @click.stop="jumpInNewWindow('prts')"
                    >
                        <ExternalLink />
                    </el-button>
                </el-tooltip>
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
    position: relative;
    width: 100%;
    height: 140px;
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

.block .corner-btn {
    position: absolute;
    right: 0px;
    bottom: 0px;
    z-index: 2;

    color: black;
    padding: 0 8px;
    border: gray solid 1px;
    border-radius: 15px;
}

.corner-btn svg {
    width: 16px;
    height: 16px;
    display: inline-block;
}
</style>
