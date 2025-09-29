<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import PageBanner from '@/components/partial/PageBanner.vue'
import { Icon } from '@iconify/vue'

const appConfig = useAppConfig()
const layoutStore = useLayoutStore()

layoutStore.setAside(['blog-stats',  'blog-site', 'blog-tech', 'blog-log', 'latest-comments'])

useSeoMeta({
    title: '友链朋友圈',
    ogType: 'profile',
    description: `${appConfig.title}的友链朋友圈页面。`,
})

// 配置选项
const UserConfig = reactive({
  // 使用fcircle1中的数据链接
  api_url: 'https://fc.linux-qitong.top/', 
  page_size: 20,
  error_img: "https://fastly.jsdelivr.net/gh/willow-god/Friend-Circle-Lite@latest/static/favicon.ico"
})

// 状态管理
const allArticles = ref([])
const displayCount = ref(20)
const isLoading = ref(true)
const randomArticle = ref(null)
const showAvatarPopup = ref(false)
const selectedAuthor = ref('')
const selectedAuthorAvatar = ref('')
const selectedArticleLink = ref('')
const articlesByAuthor = ref({})
const lastUpdatedDate = ref('')

// 计算属性
const displayedArticles = computed(() => {
  return allArticles.value.slice(0, displayCount.value)
})

const hasMoreArticles = computed(() => {
  return allArticles.value.length > displayCount.value
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

// 页面挂载时初始化
onMounted(() => {
  fetchData()
})

// 清理事件监听
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 刷新随机文章
const refreshRandomArticle = () => {
  if (allArticles.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * allArticles.value.length)
    randomArticle.value = allArticles.value[randomIndex]
  }
}

// 加载更多
const loadMore = () => {
  displayCount.value += UserConfig.page_size
}

// 显示作者文章模态框
const showAvatarPosts = (author, avatar, articleLink) => {
  selectedAuthor.value = author
  selectedAuthorAvatar.value = avatar
  selectedArticleLink.value = articleLink
  showAvatarPopup.value = true
}

// 关闭头像弹窗
const closeAvatarPopup = () => {
  showAvatarPopup.value = false
}

// 监听点击外部关闭弹窗
const handleClickOutside = (event) => {
  const popup = document.getElementById('avatar-popup')
  if (popup && !popup.contains(event.target) && showAvatarPopup.value) {
    closeAvatarPopup()
  }
}

// 头像加载处理
const avatarOrDefault = (avatar) => {
  return avatar || UserConfig.error_img
}

const handleAvatarError = (event) => {
  event.target.src = UserConfig.error_img
}

// 获取数据
const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await fetch(`${UserConfig.api_url}all.json`)
    const data = await response.json()
    
    // 处理数据
    allArticles.value = data.article_data.map(item => ({
      id: item.link + Math.random(), // 确保唯一ID
      title: item.title,
      link: item.link,
      author: item.author,
      created: item.created,
      avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author}`
    }))
    
    // 按作者分组
    articlesByAuthor.value = allArticles.value.reduce((acc, article) => {
      if (!acc[article.author]) {
        acc[article.author] = []
      }
      acc[article.author].push(article)
      return acc
    }, {})
    
    // 初始化随机文章
    refreshRandomArticle()
    
    // 设置最新更新日期
    if (allArticles.value.length > 0) {
      const sortedArticles = [...allArticles.value].sort((a, b) => 
        new Date(b.created) - new Date(a.created)
      )
      lastUpdatedDate.value = formatDate(sortedArticles[0].created)
    }
  } catch (error) {
    console.error('加载文章失败:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <PageBanner 
    image="https://bu.dusays.com/2025/02/18/67b46c6d8c9f1.webp" 
    title="博友圈" 
    description="发现更多有趣的博主"
  >
    <div class="friend-stats">
      <div class="update-time">Updated at {{ lastUpdatedDate || '2025-07-17' }}</div>
      <div class="powered-by">Powered by FriendCircleLite</div>
    </div>
  </PageBanner>
  
  <div class="page-fcircle">
    <div class="article-list">
      <!-- 随机文章区域 -->
      <div v-if="randomArticle" class="random-article">
        <div class="random-title">随机文章</div>
        <div class="article-item">
          <a 
            :href="randomArticle.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-container gradient-card"
          >
            <span class="article-author">{{ randomArticle.author }}</span>
            <span class="article-title">{{ randomArticle.title }}</span>
            <span class="article-date">{{ formatDate(randomArticle.created) }}</span>
          </a>
        </div>
        <button class="refresh-btn gradient-card" @click="refreshRandomArticle">
          <Icon name="uim:process" size="16" />
        </button>
      </div>

      <!-- 文章列表区域 -->
      <div class="articles-list">
        <div 
          v-for="(article, index) in displayedArticles" 
          :key="article.id" 
          class="article-item new-item"
          :style="{ '--delay': index * 0.05 + 's' }"
        >
          <div class="article-image" @click="showAvatarPosts(article.author, article.avatar, article.link)">
            <img 
              :src="avatarOrDefault(article.avatar)" 
              @error="handleAvatarError"
            />
          </div>
          <a 
            :href="article.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-container gradient-card"
          >
            <span class="article-author">{{ article.author }}</span>
            <span class="article-title">{{ article.title }}</span>
            <span class="article-date">{{ formatDate(article.created) }}</span>
          </a>
        </div>
      </div>

      <div class="load-more-container">
        <!-- 加载更多按钮 -->
        <button 
          v-show="hasMoreArticles" 
          class="load-more gradient-card" 
          @click="loadMore"
        >
          加载更多
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="!isLoading && allArticles.length === 0" class="error-container">
        <Icon name="ph:file-text-off-bold" size="4rem" class="error-icon" />
        <p>暂无文章数据</p>
        <p class="empty-hint">请稍后再试</p>
      </div>

      <!-- 作者模态框 - 时间线样式 -->
      <Transition name="modal">
        <div 
          v-if="showAvatarPopup && selectedAuthor && articlesByAuthor[selectedAuthor]"
          id="avatar-popup"
          class="modal"
          @click="closeAvatarPopup"
        >
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <img 
                :src="avatarOrDefault(selectedAuthorAvatar)" 
                @error="handleAvatarError" 
                class="modal-avatar-img"
              />
              <h3>{{ selectedAuthor }}</h3>
              <a 
                :href="selectedArticleLink" 
                target="_blank"
                rel="noopener noreferrer"
                class="author-link"
              >
                <Icon name="lucide:external-link" size="16" />
              </a>
            </div>
            <div class="modal-body">
              <div class="timeline">
                <div 
                  v-for="(article, index) in articlesByAuthor[selectedAuthor].slice(0, 10)"
                  :key="article.id"
                  class="timeline-item"
                  :style="{ '--delay': index * 0.05 + 's' }"
                >
                  <span class="date">{{ formatDate(article.created) }}</span>
                  <a 
                    :href="article.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="article-title"
                    @click="closeAvatarPopup"
                  >
                    {{ article.title }}
                  </a>
                </div>
              </div>
            </div>
            <div class="modal-avatar">
              <img 
                :src="avatarOrDefault(selectedAuthorAvatar)" 
                @error="handleAvatarError"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// 友链朋友圈样式
.page-fcircle {
  animation: float-in .2s backwards;
  margin: 1rem;
}
.friend-stats {
  align-items: flex-end;
  color: #eee;
  display: flex;
  flex-direction: column;
  font-family: var(--font-monospace);
  font-size: .7rem;
  gap: .1rem;
  opacity: .7;
  text-shadow: 0 4px 5px rgba(0,0,0,.5);
  .update-time {
    opacity: 1;
  }
  .powered-by {
    opacity: .8;
  }
}
.article-list {
  .random-article {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;
    margin: 1rem 0;
    .random-title {
      font-size: 1.2rem;
      white-space: nowrap;
    }
    .article-item {
      flex: 1;
      min-width: 0;
      .article-container {
        min-width: 0;
        .article-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    .refresh-btn {
      align-items: center;
      border-radius: 8px;
      box-shadow: 0 0 0 1px var(--c-bg-soft);
      color: var(--c-text-2);
      cursor: pointer;
      display: flex;
      flex-shrink: 0;
      height: 2.5rem;
      justify-content: center;
      transition: all .2s ease;
      width: 2.5rem;
    }
  }
  .articles-list {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }
}
.article-list .random-article .article-item .article-container .article-author,.article-list .random-article .article-item .article-container .article-date {
  flex-shrink: 0;
}
.article-item {
  align-items: center;
  display: flex;
  gap: 10px;
  width: 100%;
  &.new-item {
    animation: float-in .2s var(--delay) backwards;
  }
  .article-image {
    border-radius: 50%;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    flex-shrink: 0;
    height: 2rem;
    overflow: hidden;
    width: 2rem;
    img {
      height: 100%;
      -o-object-fit: cover;
      object-fit: cover;
      opacity: .8;
      transition: all .2s;
      width: 100%;
    }
  }
  .article-container {
    align-items: center;
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    gap: 5px;
    height: 2.5rem;
    overflow: hidden;
    padding: 10px;
    width: 100%;
    &:hover {
      .article-title {
        color: var(--c-text);
      }
    }
    .article-author {
      color: var(--c-text-3);
      font-size: .85rem;
    }
    .article-title {
      color: var(--c-text-2);
      flex: 1;
      font-size: .9375rem;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color .2s;
      white-space: nowrap;
    }
    .article-date {
      color: var(--c-text-3);
      font-family: var(--font-monospace);
      font-size: .75rem;
    }
  }
}
.load-more {
  background-color: var(--ld-bg-card);
  border-radius: 8px;
  box-shadow: .1em .2em .5rem var(--ld-shadow);
  display: block;
  font-size: .875rem;
  height: 42px;
  margin: 1rem auto;
  padding: .75rem;
  width: 200px;
  &:hover {
    color: var(--c-text);
  }
}
.skeleton-avatar {
  outline: 1px solid var(--c-border);
}
.skeleton-avatar,.skeleton-text {
  animation: pulse-552a4b19 1.5s infinite;
  background: var(--c-bg-soft);
}
.skeleton-text {
  border-radius: 4px;
  height: .875rem;
}
.skeleton {
  .article-author {
    width: 60px;
  }
  .article-title {
    flex: 1;
    margin: 0 10px;
  }
  .article-date {
    width: 80px;
  }
}
.skeleton-load-more {
  animation: pulse-552a4b19 1.5s infinite;
  background: var(--c-bg-soft);
  box-shadow: none;
}
.modal {
  align-items: center;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
  display: flex;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  position: fixed;
  z-index: 100;
  .modal-content {
    background-color: var(--c-bg-a50);
    border-radius: 12px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    max-height: 80vh;
    max-width: 500px;
    overflow-y: auto;
    padding: 1.25rem;
    position: relative;
    width: 90%;
    .modal-header {
      align-items: center;
      border-bottom: 1px solid var(--c-bg-soft);
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      img {
        border-radius: 50%;
        height: 50px;
        -o-object-fit: cover;
        object-fit: cover;
        width: 50px;
      }
      h3 {
        flex: 1;
        font-size: 1.2rem;
        margin: 0;
      }
      .author-link {
        border-radius: 8px;
        color: var(--c-text-2);
        padding: 8px;
        transition: all .3s;
        &:hover {
          background: var(--c-bg-soft);
          color: var(--c-text);
        }
      }
    }
    .modal-body {
      .timeline {
        position: relative;
        &:after {
          background-color: var(--c-bg-soft);
          bottom: 0;
          content: "";
          left: .25rem;
          position: absolute;
          top: .5rem;
          transform: translate(-50%);
          width: 2px;
        }
        .timeline-item {
          animation: slideIn-552a4b19 .3s ease-out both;
          color: var(--c-text-2);
          padding: 0 0 1rem 1.25rem;
          position: relative;
          &:before {
            background-color: var(--c-text-2);
            border-radius: 50%;
            content: "";
            height: .5rem;
            left: .25rem;
            position: absolute;
            top: .5rem;
            transform: translateY(-50%) translate(-50%);
            transition: transform .3s ease,box-shadow .3s ease;
            width: .5rem;
            z-index: 1;
          }
          &:hover {
            &:before {
              box-shadow: 0 0 8px var(--c-text-2);
              transform: translateY(-50%) translate(-50%) scale(1.5);
            }
          }
          .date {
            color: var(--c-text-3);
            display: block;
            font-family: var(--font-monospace);
            font-size: .875rem;
            margin-bottom: .3rem;
          }
          .article-title {
            color: var(--c-text-2);
            line-height: 1.4;
            transition: color .3s;
            &:hover {
              color: var(--c-text);
            }
          }
        }
      }
    }
    .modal-avatar {
      border-radius: 50%;
      bottom: 1.25rem;
      filter: blur(5px);
      height: 128px;
      opacity: .6;
      overflow: hidden;
      pointer-events: none;
      position: absolute;
      right: 1.25rem;
      width: 128px;
      z-index: 1;
      img {
        height: 100%;
        -o-object-fit: cover;
        object-fit: cover;
        width: 100%;
      }
    }
  }
}

.modal-enter-active,.modal-enter-active .modal-content,.modal-leave-active,.modal-leave-active .modal-content {
  transition: all .3s ease;
}
.modal-enter-from,.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-content,.modal-leave-to .modal-content {
  transform: translateY(-20px);
}
.modal-enter-to,.modal-leave-from {
  opacity: 1;
}
.modal-enter-to .modal-content,.modal-leave-from .modal-content {
  transform: translateY(0);
}
.error-container {
  align-items: center;
  color: var(--c-text-2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 400px;
  justify-content: center;
  .error-icon {
    color: var(--c-danger);
    font-size: 4rem;
  }
}
</style>

<style lang="css" scoped>
@keyframes pulse-552a4b19 {
    0% {
        opacity: 1
    }

    50% {
        opacity: .5
    }

    to {
        opacity: 1
    }
}

@keyframes slideIn-552a4b19 {
    0% {
        opacity: 0;
        transform: translateY(20px)
    }

    to {
        opacity: 1;
        transform: translateY(0)
    }
}

@keyframes float-in {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}


@media (max-width: 768px) {
    .random-article .random-title {
        display:none
    }

    .page-fcircle .article-item .article-container {
        flex-wrap: wrap;
        height: auto
    }

    .page-fcircle .article-item .article-container .article-author {
        flex-grow: 1
    }

    .page-fcircle .article-item .article-container .article-title {
        flex-basis: 100%;
        order: 3;
        white-space: normal
    }

    .page-fcircle .skeleton .article-title {
        height: 1.75rem;
        margin: -1px 0
    }
}
</style>
