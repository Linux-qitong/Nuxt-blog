<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const laqTime = ref<HTMLElement | null>(null)
let intervalId: number | null = null

function secondToDate(second: number) {
  if (!second) return [0, 0, 0, 0, 0]
  const time = [0, 0, 0, 0, 0] as number[]
  if (second >= 31536000) {
    time[0] = parseInt((second / 31536000).toString())
    second %= 31536000
  }
  if (second >= 86400) {
    time[1] = parseInt((second / 86400).toString())
    second %= 86400
  }
  if (second >= 3600) {
    time[2] = parseInt((second / 3600).toString())
    second %= 3600
  }
  if (second >= 60) {
    time[3] = parseInt((second / 60).toString())
    second %= 60
  }
  if (second > 0) {
    time[4] = second
  }
  return time
}

function setTime() {
  if (!laqTime.value) return
  
  const createTime = Math.round(new Date(Date.UTC(2023, 2, 23, 1, 30, 0)).getTime() / 1000)
  const timestamp = Math.round(((new Date()).getTime() + 28800000) / 1000)
  const currentTime = secondToDate(timestamp - createTime)
  const currentTimeHtml = `${currentTime[0]} 年 ${currentTime[1]} 天 ${currentTime[2]} 时 ${currentTime[3]} 分 ${currentTime[4]} 秒`
  
  if (laqTime.value) {
    laqTime.value.innerHTML = currentTimeHtml
  }
}

onMounted(() => {
  laqTime.value = document.getElementById('laq_time') as HTMLElement
  setTime()
  intervalId = window.setInterval(setTime, 1000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
<ZWidget card title="恋爱墙">
  <div style="text-align: center;">
    <img src="/img/avatar.webp"
      style="width: 50px;height: 50px;vertical-align: -20px;border-radius: 50%;margin-right: 5px;margin-bottom: 5px;-webkit-box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);border: 2px solid #fff;" />
    <Icon name="ph:lightning-fill" size="20" style="margin-left: 5px;margin-right: 5px;" class="my-face" />
    <img src="https://bu.dusays.com/2025/03/14/67d3e8d22e62e.webp"
      style="width: 50px;height: 50px;vertical-align: -20px;border-radius: 50%;margin-left: 5px;margin-bottom: 5px;-webkit-box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);border: 2px solid #fff;" /><br />
    <span id="laq_time"></span>
  </div>
</ZWidget>
</template>
