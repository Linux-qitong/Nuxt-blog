<script setup lang="ts">
defineProps<{
  image: String
  title: String
  description?: String
}>()
</script>

<template>
<div class="page-banner" :style="{ backgroundImage: `url(${image})` }">
  <div class="banner-content">
    <h1>{{ title }}</h1>
    <p v-if="description">{{ description }}</p>
  </div>
  <div class="banner-extra">
    <slot></slot>
  </div>
</div>
</template>

<style lang="scss" scoped>
.page-banner {
  background-position: 50%;
  background-size: cover;
  border-radius: 8px;
  margin: 1rem;
  max-height: 320px;
  min-height: 256px;
  overflow: hidden;
  position: relative;

  .banner-content {
    color: #eee;
    display: flex;
    flex-direction: column;
    top: 0;
    bottom: 0;
    left: 0;
    justify-content: space-between;
    padding: 1rem;
    position: absolute;
    text-shadow: 0 4px 5px rgba(#000, .5);

    p {
      opacity: .9;
    }
  }

  .banner-extra {
    align-items: flex-end;
    display: flex;
    bottom: 0;
    right: 0;
    justify-content: flex-end;
    margin: 1rem;
    position: absolute;
  }
}
</style>
