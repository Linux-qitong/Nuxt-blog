<script setup lang="ts">
import talks from '~/talks'

const title = '说说'
const description = '记录生活点滴，一些想法。'
const image = 'https://x.xinb.de/i/2025/04/25/212746.webp'
useSeoMeta({ title, description, ogImage: image })

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'comm-group'])

const { author } = useAppConfig()
</script>

<template>
<ZPageBanner :title :description :image />

<div class="talk-list">
  <div class="talk-item" v-for="talk in talks">
    <div class="talk-meta">
      <NuxtImg class="avatar" :src="author.avatar" :alt="author.name" />
      <div class="info">
        <div class="nick">
          {{ author.name }}
          <Icon class="verified" name="i-material-symbols:verified" />
        </div>
        <div class="date">{{ getPostDate(talk.date) }}</div>
      </div>
    </div>

    <div class="talk-content">
      <div class="text">{{ talk.content }}</div>
    </div>

    <div class="talk-bottom">
      <div class="tags" v-if="talk.tags">
        <span class="tag" v-for="tag in talk.tags">{{ tag }}</span>
        <span class="location" v-if="talk.location">
          <Icon name="i-ph:map-pin-bold" />
          {{ talk.location }}
        </span>
      </div>
      <button class="comment-btn">
        <Icon name="i-ph:chats-bold"></Icon>
      </button>
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
.talk-list {
  animation: float-in .2s backwards;
  margin: 1rem;

  .talk-item {
    animation: float-in .3s backwards;
    animation-delay: var(--delay);
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    flex-direction: column;
    gap: .5rem;
    margin-bottom: 1rem;
    padding: 1rem;

    .talk-meta {
      align-items: center;
      display: flex;
      gap: 10px;

      .avatar {
        border-radius: 2em;
        box-shadow: 2px 4px 1rem var(--ld-shadow);
        width: 3em;
      }

      .nick {
        align-items: center;
        display: flex;
        gap: 5px;
      }

      .date {
        color: var(--c-text-3);
        font-family: var(--font-monospace);
        font-size: .8rem;
      }

      .verified {
        color: var(--c-primary);
        font-size: 16px;
      }
    }
  
    .talk-content {
      color: var(--c-text-2);
      display: flex;
      flex-direction: column;
      gap: .5rem;
      line-height: 1.6;
    }

    .talk-bottom {
      align-items: center;
      color: var(--c-text-3);
      display: flex;
      justify-content: space-between;

      .tags {
        display: flex;
        font-size: .7rem;
        gap: 4px;
      }

      .tag, .location {
        background-color: var(--c-bg-2);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        padding: 2px 4px;
        transition: all .2s;
      }

      .tag::before {
        content: "🏷️";
      }

      .location {
        color: var(--c-primary);
      }
    }
  }
}
</style>
