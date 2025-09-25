<script setup lang="ts">
import talks from '~/talks'

const title = '说说'
const description = '记录生活点滴，一些想法。'
const image = 'https://bu.dusays.com/2025/02/18/67b46c6d999ea.webp'
useSeoMeta({ title, description, ogImage: image })

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'comm-group'])

const { author } = useAppConfig()

// 图片查看器相关状态
const showImageViewer = ref(false)
const currentImage = ref('')

// 打开图片查看器
const openImageViewer = (imgSrc) => {
  currentImage.value = imgSrc
  showImageViewer.value = true
}

// 关闭图片查看器
const closeImageViewer = () => {
  showImageViewer.value = false
  currentImage.value = ''
}
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
      <div class="text" v-html="talk.content"></div>
      
      <!-- 显示图片 -->
      <div class="talk-images" v-if="talk.images">
        <NuxtImg 
          v-for="(img, index) in Array.isArray(talk.images) ? talk.images : [talk.images]" 
          :key="index"
          :src="img" 
          :alt="`Image ${index + 1}`"
          loading="lazy"
          class="talk-image"
          @click="openImageViewer(img)"
        />
      </div>
      
      <!-- 显示视频 -->
      <div class="talk-video" v-if="talk.videoEmbed">
        <!-- 处理原始视频 -->
        <video 
          v-if="talk.videoEmbed.type === 'raw'" 
          :poster="talk.videoEmbed.poster"
          controls 
          class="video-player"
        >
          <source :src="talk.videoEmbed.id" type="video/mp4" />
          您的浏览器不支持视频播放
        </video>
        
        <!-- 处理B站视频 -->
        <div 
          v-else-if="talk.videoEmbed.type === 'bilibili'" 
          class="bilibili-player"
          :style="{ paddingBottom: '56.25%', position: 'relative', height: 0 }"
        >
          <iframe 
            :src="`https://player.bilibili.com/player.html?bvid=${talk.videoEmbed.id}&high_quality=1&danmaku=0`"
            scrolling="no" 
            border="0" 
            frameborder="no" 
            framespacing="0"
            allowfullscreen="true" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          ></iframe>
        </div>
      </div>
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

<!-- 图片查看器 -->
<div v-if="showImageViewer" class="image-viewer-overlay" @click="closeImageViewer">
  <div class="image-viewer-content" @click.stop>
    <button class="image-viewer-close" @click="closeImageViewer">✕</button>
    <img :src="currentImage" class="image-viewer-image" />
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

    // 图片样式
    .talk-images {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
      
      .talk-image {
        border-radius: 8px; // 增加圆角大小
        width: 180px; // 设置固定宽度
        height: 180px; // 设置固定高度，使图片为正方形
        object-fit: cover; // 确保图片填充整个区域，可能会裁剪
        cursor: pointer; // 鼠标悬停显示指针
        transition: transform 0.2s ease; // 点击时的过渡效果
        
        &:hover {
          transform: scale(1.02); // 悬停时轻微放大
        }
      }
    }
    
    // 视频样式
    .talk-video {
      border-radius: 8px; // 与图片圆角保持一致
      margin-top: 8px;
      overflow: hidden;
      
      .video-player {
        border-radius: 8px; // 与图片圆角保持一致
        width: 100%;
        max-height: 480px;
      }
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

// 图片查看器样式
.image-viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

.image-viewer-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.image-viewer-image {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 4px; // 与原图片圆角保持一致
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.image-viewer-close {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
