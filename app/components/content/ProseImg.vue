<script setup lang="ts">
import { ProseImg as BaseProseImg } from '#components'
import { computed } from 'vue'
import Pic from './Pic.vue'

interface Props {
  src: string
  alt?: string
  title?: string
  width?: number | string
  height?: number | string
  loading?: 'eager' | 'lazy'
}

const props = defineProps<Props>()

const caption = computed(() => props.alt || props.title || '')
</script>

<template>
  <Pic
    :src="props.src"
    :caption="caption"
    :width="props.width"
    :height="props.height"
    zoom
  />
</template>

<style scoped>
:deep(.image) {
  margin: 0;
}
</style>