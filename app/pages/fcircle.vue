<template>
  <div class="page-fcircle">
    <!-- 顶部标题区域 -->
    <div class="fcircle-header">
      <h1 class="fcircle-title">博友圈</h1>
      <p class="fcircle-subtitle">叮！能量已加满</p>
      <div class="friend-stats">
        <div class="update-time">updated at {{ formatUpdateTime }}</div>
        <div class="powered-by">powered by <a href="https://github.com/Linux-qitong/Friend-Circle-Lite/tree/page/main" target="_blank" rel="noopener noreferrer" style="color: inherit;">Friend-Circle-Lite</a></div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <!-- 随机文章 -->
      <div v-if="randomArticle" class="random-article">
        <div class="random-title">随机文章</div>
        <div class="article-item">
          <div class="article-image">
            <img 
              :src="randomArticle.avatar" 
              :alt="randomArticle.author"
              @click.stop="showAvatarPosts(randomArticle.author, $event)"
              style="cursor: pointer;"
            />
          </div>
          <a 
            :href="randomArticle.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-container"
          >
            <span class="article-author">{{ randomArticle.author }}</span>
            <span class="article-title">{{ randomArticle.title }}</span>
            <span class="article-date">{{ formatPubDate(randomArticle.pubDate) }}</span>
          </a>
        </div>
        <button class="refresh-btn" @click="refreshRandomArticle">
          <Icon name="uim:process" size="16" />
        </button>
      </div>

      <!-- 文章列表 -->
      <TransitionGroup name="fade-in" tag="div" class="articles-list">
        <div 
          v-for="(article, index) in displayedArticles" 
          :key="article.id"
          class="article-item new-item"
          :style="{ '--delay': index * 0.05 + 's' }"
        >
          <div class="article-image">
            <img 
              :src="article.avatar" 
              :alt="article.author"
              @click.stop="showAvatarPosts(article.author, $event)"
              style="cursor: pointer;"
            />
          </div>
          <a 
            :href="article.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-container"
          >
            <span class="article-author">{{ article.author }}</span>
            <span class="article-title">{{ article.title }}</span>
            <span class="article-date">{{ formatPubDate(article.pubDate) }}</span>
          </a>
        </div>
      </TransitionGroup>

      <!-- 加载更多按钮 -->
      <div v-if="hasMoreArticles" class="load-more-container">
        <button class="load-more" @click="loadMore">加载更多</button>
      </div>

      <!-- 空状态 -->
      <div v-if="!isLoading && allArticles.length === 0" class="error-container">
        <Icon name="ph:file-text-off-bold" size="4rem" class="error-icon" />
        <p>暂无文章数据</p>
        <p class="empty-hint">请稍后再试</p>
      </div>

      <!-- 头像点击弹窗 - 时间线样式 -->
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
                :src="articlesByAuthor[selectedAuthor][0].avatar" 
                :alt="selectedAuthor"
                class="modal-avatar-img"
              />
              <h3>{{ selectedAuthor }}</h3>
            </div>
            <div class="modal-body">
              <div class="timeline">
                <div 
                  v-for="(article, index) in articlesByAuthor[selectedAuthor].slice(0, 10)"
                  :key="article.id"
                  class="timeline-item"
                  :style="{ '--delay': index * 0.05 + 's' }"
                >
                  <span class="date">{{ formatPubDate(article.pubDate) }}</span>
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
                :src="articlesByAuthor[selectedAuthor][0].avatar" 
                :alt="selectedAuthor"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Icon } from '@iconify/vue'
import { useAppConfig } from '#imports'
import { useLayoutStore } from '~/stores/layout'

const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
layoutStore.setAside([])

useSeoMeta({
  title: '博友圈',
  description: `${appConfig.title}的博友圈，展示友链博客的最新文章动态。`,
  ogImage: appConfig.author.avatar,
})

// 类型定义
interface FcircleArticle {
  id: string
  author: string
  title: string
  link: string
  pubDate: string
  avatar: string
}

// 状态管理
const allArticles = ref<FcircleArticle[]>([])
const articlesByAuthor = ref<Record<string, FcircleArticle[]>>({})
const randomArticle = ref<FcircleArticle | null>(null)
const displayCount = ref(20)
const isLoading = ref(true)
const showAvatarPopup = ref(false)
const selectedAuthor = ref('')

// 计算属性
const displayedArticles = computed(() => {
  return allArticles.value.slice(0, displayCount.value)
})

const hasMoreArticles = computed(() => {
  return allArticles.value.length > displayCount.value
})

const formatUpdateTime = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
})

// 格式化发布日期
function formatPubDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

// 刷新随机文章
function refreshRandomArticle() {
  if (allArticles.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * allArticles.value.length)
    randomArticle.value = allArticles.value[randomIndex]
  }
}

// 加载更多
function loadMore() {
  displayCount.value += 20
}

// 显示头像帖子
function showAvatarPosts(author: string, event: MouseEvent) {
  event.stopPropagation()
  selectedAuthor.value = author
  showAvatarPopup.value = true
}

// 关闭头像弹窗
function closeAvatarPopup() {
  showAvatarPopup.value = false
}

// 获取数据
async function fetchData() {
  try {
    isLoading.value = true
    const response = await fetch('https://fc.linux-qitong.top/all.json')
    const data = await response.json()
    
    // 处理数据
    allArticles.value = data.article_data.map((item: any) => ({
      id: item.link + Math.random(), // 确保唯一ID
      title: item.title,
      link: item.link,
      author: item.author,
      pubDate: item.created,
      avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author}`
    }))
    
    // 按作者分组
    articlesByAuthor.value = allArticles.value.reduce((acc: Record<string, FcircleArticle[]>, article: FcircleArticle) => {
      if (!acc[article.author]) {
        acc[article.author] = []
      }
      acc[article.author].push(article)
      return acc
    }, {})
    
    // 初始化随机文章
    refreshRandomArticle()
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    isLoading.value = false
  }
}

// 页面挂载时获取数据
onMounted(() => {
  fetchData()
})

// 监听点击外部关闭弹窗
function handleClickOutside(event: MouseEvent) {
  const popup = document.getElementById('avatar-popup')
  if (popup && !popup.contains(event.target as Node) && showAvatarPopup.value) {
    closeAvatarPopup()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style lang="scss" scoped>
// CSS 变量定义
:root {
  --c-bg: #f8f9fa;
  --c-bg-soft: #e9ecef;
  --c-bg-a50: rgba(255, 255, 255, 0.5);
  --c-text: #212529;
  --c-text-2: #6c757d;
  --c-text-3: #adb5bd;
  --c-border: #dee2e6;
  --c-danger: #dc3545;
  --font-monospace: 'DFPKingGothicGB-Regular', monospace;
}

// 主容器
.page-fcircle {
  animation: float-in 0.2s backwards;
  margin: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

// 顶部标题区域
.fcircle-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.fcircle-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.05) 75%, transparent 75%, transparent);
  background-size: 20px 20px;
}

.fcircle-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  position: relative;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.fcircle-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  position: relative;
}

// 统计信息
.friend-stats {
  align-items: flex-end;
  color: #eee;
  display: flex;
  flex-direction: column;
  font-family: var(--font-monospace);
  font-size: 0.7rem;
  gap: 0.1rem;
  opacity: 0.7;
  text-shadow: 0 4px 5px rgba(0, 0, 0, 0.5);
  position: relative;
}

.friend-stats .update-time {
  opacity: 1;
}

.friend-stats .powered-by {
  opacity: 0.8;
}

// 随机文章区域
.article-list .random-article {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 10px;
  justify-content: space-between;
  margin: 1rem 0;
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.article-list .random-article .random-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--c-text);
  white-space: nowrap;
}

.article-list .random-article .article-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.article-list .random-article .article-item .article-image {
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--c-bg-soft);
  display: flex;
  flex-shrink: 0;
  height: 2rem;
  overflow: hidden;
  width: 2rem;
}

.article-list .random-article .article-item .article-image img {
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  transition: all 0.2s;
  width: 100%;
}

.article-list .random-article .article-item .article-container {
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--c-bg-soft);
  display: flex;
  gap: 5px;
  height: 2.5rem;
  overflow: hidden;
  padding: 10px;
  width: 100%;
  background: white;
  transition: all 0.2s ease;
  text-decoration: none;
}

.article-list .random-article .article-item .article-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.article-list .random-article .article-item .article-container:hover .article-title {
  color: var(--c-text);
}

.article-list .random-article .article-item .article-container .article-author {
  color: var(--c-text-3);
  font-size: 0.85rem;
  font-weight: 500;
}

.article-list .random-article .article-item .article-container .article-title {
  color: var(--c-text-2);
  flex: 1;
  font-size: 0.9375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
  white-space: nowrap;
  font-weight: 500;
}

.article-list .random-article .article-item .article-container .article-date {
  color: var(--c-text-3);
  font-family: var(--font-monospace);
  font-size: 0.75rem;
}

.article-list .random-article .refresh-btn {
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--c-bg-soft);
  color: var(--c-text-2);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 2.5rem;
  justify-content: center;
  transition: all 0.2s ease;
  width: 2.5rem;
  background: white;
  border: none;
}

.article-list .random-article .refresh-btn:hover {
  background: var(--c-bg-soft);
  color: var(--c-text);
}

// 文章列表
.article-list .articles-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.article-item {
  align-items: center;
  display: flex;
  gap: 10px;
  width: 100%;
}

.article-item.new-item {
  animation: float-in 0.2s var(--delay) backwards;
}

.article-item .article-image {
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--c-bg-soft);
  display: flex;
  flex-shrink: 0;
  height: 2rem;
  overflow: hidden;
  width: 2rem;
}

.article-item .article-image img {
  height: 100%;
  object-fit: cover;
  opacity: 0.8;
  transition: all 0.2s;
  width: 100%;
}

.article-item .article-container {
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--c-bg-soft);
  display: flex;
  gap: 5px;
  height: 2.5rem;
  overflow: hidden;
  padding: 10px;
  width: 100%;
  background: white;
  transition: all 0.2s ease;
  text-decoration: none;
}

.article-item .article-container:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.article-item .article-container:hover .article-title {
  color: var(--c-text);
}

.article-item .article-container .article-author {
  color: var(--c-text-3);
  font-size: 0.85rem;
  font-weight: 500;
}

.article-item .article-container .article-title {
  color: var(--c-text-2);
  flex: 1;
  font-size: 0.9375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s;
  white-space: nowrap;
  font-weight: 500;
}

.article-item .article-container .article-date {
  color: var(--c-text-3);
  font-family: var(--font-monospace);
  font-size: 0.75rem;
}

// 加载更多按钮
.load-more-container {
  text-align: center;
  margin: 2rem 0;
}

.load-more {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0.1em 0.2em 0.5rem rgba(0, 0, 0, 0.1);
  display: block;
  font-size: 0.875rem;
  height: 42px;
  margin: 1rem auto;
  padding: 0.75rem;
  width: 200px;
  border: none;
  color: var(--c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more:hover {
  color: var(--c-text);
  transform: translateY(-1px);
  box-shadow: 0.2em 0.3em 0.8rem rgba(0, 0, 0, 0.15);
}

// 空状态
.error-container {
  align-items: center;
  color: var(--c-text-2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 400px;
  justify-content: center;
}

.error-container .error-icon {
  color: var(--c-danger);
  font-size: 4rem;
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: var(--c-text-3);
}

// 动画
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

.fade-in-enter-active {
  animation: float-in 0.3s ease-out;
}

.fade-in-leave-active {
  animation: float-in 0.3s ease-in reverse;
}

// 模态框样式
.modal {
  align-items: center;
  backdrop-filter: blur(20px);
  display: flex;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  position: fixed;
  z-index: 100;
  background: rgba(0, 0, 0, 0.3);
}

.modal .modal-content {
  background-color: var(--c-bg-a50);
  border-radius: 12px;
  box-shadow: 0 0 0 1px var(--c-bg-soft);
  max-height: 80vh;
  max-width: 500px;
  overflow-y: auto;
  padding: 1.25rem;
  position: relative;
  width: 90%;
  background: white;
  backdrop-filter: blur(20px);
}

.modal .modal-content .modal-header {
  align-items: center;
  border-bottom: 1px solid var(--c-bg-soft);
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 15px;
}

.modal .modal-content .modal-header img.modal-avatar-img {
  border-radius: 50%;
  height: 50px;
  object-fit: cover;
  width: 50px;
}

.modal .modal-content .modal-header h3 {
  flex: 1;
  font-size: 1.2rem;
  margin: 0;
  color: var(--c-text);
}

.modal .modal-content .modal-body .timeline {
  position: relative;
}

.modal .modal-content .modal-body .timeline::after {
  background-color: var(--c-bg-soft);
  bottom: 0;
  content: "";
  left: 0.25rem;
  position: absolute;
  top: 0.5rem;
  transform: translateX(-50%);
  width: 2px;
}

.modal .modal-content .modal-body .timeline .timeline-item {
  animation: slideIn 0.3s ease-out both;
  color: var(--c-text-2);
  padding: 0 0 1rem 1.25rem;
  position: relative;
}

.modal .modal-content .modal-body .timeline .timeline-item::before {
  background-color: var(--c-text-2);
  border-radius: 50%;
  content: "";
  height: 0.5rem;
  left: 0.25rem;
  position: absolute;
  top: 0.5rem;
  transform: translateY(-50%) translateX(-50%);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 0.5rem;
  z-index: 1;
}

.modal .modal-content .modal-body .timeline .timeline-item:hover::before {
  box-shadow: 0 0 8px var(--c-text-2);
  transform: translateY(-50%) translateX(-50%) scale(1.5);
}

.modal .modal-content .modal-body .timeline .timeline-item .date {
  color: var(--c-text-3);
  display: block;
  font-family: var(--font-monospace);
  font-size: 0.875rem;
  margin-bottom: 0.3rem;
}

.modal .modal-content .modal-body .timeline .timeline-item .article-title {
  color: var(--c-text-2);
  line-height: 1.4;
  transition: color 0.3s;
  text-decoration: none;
  display: block;
  font-weight: 500;
}

.modal .modal-content .modal-body .timeline .timeline-item .article-title:hover {
  color: var(--c-text);
}

.modal .modal-content .modal-avatar {
  border-radius: 50%;
  bottom: 1.25rem;
  filter: blur(5px);
  height: 128px;
  opacity: 0.6;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  right: 1.25rem;
  width: 128px;
  z-index: 1;
}

.modal .modal-content .modal-avatar img {
  height: 100%;
  object-fit: cover;
  width: 100%;
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-enter-active .modal-content,
.modal-leave-active,
.modal-leave-active .modal-content {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  transform: translateY(0);
}

// 响应式设计
@media (max-width: 768px) {
  .page-fcircle {
    margin: 0.5rem;
  }
  
  .random-article .random-title {
    display: none;
  }
  
  .page-fcircle .article-item .article-container {
    flex-wrap: wrap;
    height: auto;
  }
  
  .page-fcircle .article-item .article-container .article-author {
    flex-grow: 1;
  }
  
  .page-fcircle .article-item .article-container .article-title {
    flex-basis: 100%;
    order: 3;
    white-space: normal;
    margin-top: 0.3rem;
  }
  
  .fcircle-title {
    font-size: 2rem;
  }
  
  .fcircle-header {
    padding: 1.5rem;
  }
  
  .load-more {
    width: 100%;
  }
}
</style>