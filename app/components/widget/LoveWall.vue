<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { Temporal } from 'temporal-polyfill'
import blogConfig from '~~/blog.config'

const laqTime = ref<HTMLElement | null>(null)
let intervalId: number | null = null

const timeIntervals = [
  { label: '年', threshold: 60 * 60 * 24 * 365.2422 },
  { label: '天', threshold: 60 * 60 * 24 },
  { label: '时', threshold: 60 * 60 },
  { label: '分', threshold: 60 },
  { label: '秒', threshold: 1 },
]

// 恋爱开始时间字符串：2023年3月23日 01:30 (UTC)
const LOVE_START_TIME_STR = '2023-03-23T01:30:00+00:00'

function setTime() {
  if (!laqTime.value) return

  try {
    const loveStartTime = Temporal.Instant.from(LOVE_START_TIME_STR).toZonedDateTimeISO(blogConfig.timeZone)
    const now = Temporal.Now.zonedDateTimeISO(blogConfig.timeZone)
    const diff = now.since(loveStartTime, { largestUnit: 'second' })
    let secondsRemaining = diff.seconds

    const timeValues: number[] = []
    for (const interval of timeIntervals) {
      const count = Math.floor(secondsRemaining / interval.threshold)
      timeValues.push(count)
      secondsRemaining -= count * interval.threshold
    }

    const currentTimeHtml = `${timeValues[0]} 年 ${timeValues[1]} 天 ${timeValues[2]} 时 ${timeValues[3]} 分 ${timeValues[4]} 秒`

    laqTime.value.innerHTML = currentTimeHtml
  }
  catch (e) {
    console.error('LoveWall time calculation error:', e)
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
<BlogWidget card title="恋爱墙">
  <div style="text-align: center;">
    <img src="https://blog.linux-qitong.top/img/avatar.webp"
      style="width: 50px;height: 50px;vertical-align: -20px;border-radius: 50%;margin-right: 5px;margin-bottom: 5px;-webkit-box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);border: 2px solid #fff;" />
    <Icon name="ph:lightning-fill" size="20" style="margin-left: 5px;margin-right: 5px;" class="my-face" />
    <img src="https://bu.dusays.com/2025/03/14/67d3e8d22e62e.webp"
      style="width: 50px;height: 50px;vertical-align: -20px;border-radius: 50%;margin-left: 5px;margin-bottom: 5px;-webkit-box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);box-shadow: 1px 1px 1px rgba(0,0,0,.1), 1px 1px 1px rgba(0,0,0,0.1), 1px 1px 1px rgba(0,0,0,0.1);border: 2px solid #fff;" /><br />
    <span id="laq_time"></span>
  </div>
</BlogWidget>
</template>
