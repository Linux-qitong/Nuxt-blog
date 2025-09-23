<template>
  <div class="page-fcircle">
    <!-- 顶部标题区域 -->
    <div class="fcircle-header">
      <h1 class="fcircle-title">朋友圈统计</h1>
      <div class="stats-container">
        <div class="stat-card">
          <div class="stat-icon">📝</div>
          <div class="stat-label">文章数量</div>
          <div class="stat-value">{{ articleCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏰</div>
          <div class="stat-label">数据更新</div>
          <div class="stat-value">{{ formatUpdateTime }}</div>
        </div>
      </div>
    </div>

    <!-- 文章列表 -->
    <div class="article-list">
      <!-- 随机文章 -->
      <div v-if="randomArticle" class="random-article">
        <div class="random-title">随机文章</div>
        <div class="article-item">
          <!-- 删除随机文章部分的头像 -->
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
              @click.stop="showAvatarPosts(article.author, article.link, $event)"
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
              <a 
                :href="selectedArticleLink || '#'"
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
  title: '朋友圈',
  description: `${appConfig.title}的朋友圈，展示友链博客的最新文章动态。`,
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
const selectedArticleLink = ref('')

// 计算属性
const displayedArticles = computed(() => {
  return allArticles.value.slice(0, displayCount.value)
})

const hasMoreArticles = computed(() => {
  return allArticles.value.length > displayCount.value
})

// 文章总数
const articleCount = computed(() => {
  return allArticles.value.length
})

const formatUpdateTime = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日`
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

// 获取作者博客链接（实际应用中可能需要根据作者名称映射到博客链接）
function getAuthorBlogLink(author: string) {
  // 这里简化处理，实际应用中可能需要一个映射表
  return '#'
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
function showAvatarPosts(author: string, articleLink: string, event: MouseEvent) {
  event.stopPropagation()
  selectedAuthor.value = author
  selectedArticleLink.value = articleLink
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
// 主容器样式
.page-fcircle {
  animation: float-in .2s backwards;
  margin: 1rem;
}

// 顶部标题区域 - 统一使用CSS变量
.fcircle-header {
  background: var(--c-bg-1);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--c-border);
}

.fcircle-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--c-text);
  text-align: center;
}

// 统计容器
.stats-container {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.stat-card {
  flex: 1;
  background: var(--c-bg-2);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid var(--c-border);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--c-primary);
}

.stat-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--c-text-2);
}

.stat-label {
  font-size: 0.9rem;
  color: var(--c-text-2);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--c-primary);
}

// 深色主题下的样式优化 - 统一使用CSS变量
@media (prefers-color-scheme: dark) {
  .fcircle-header {
    background: var(--c-bg-1);
    border-color: var(--c-border);
  }
  
  .stat-card {
    background: var(--c-bg-2);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    border-color: var(--c-border);
  }
}

// 文章列表容器
.article-list {
  .random-article {
    align-items:center;
    display:flex;
    flex-direction:row;
    gap:10px;
    justify-content:space-between;
    margin:1rem 0;
    background: transparent;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .random-article .random-title {
    font-size:1.2rem;
    white-space:nowrap;
    font-weight: 600;
    color: var(--c-text);
  }

  .random-article .article-item {
    flex:1;
    min-width:0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .random-article .article-item .article-container {
    min-width:0;
    width: 100%;
    margin-left: 0;
    align-items:center;
    border-radius:8px;
    box-shadow:0 0 0 1px var(--c-bg-soft);
    display:flex;
    gap:5px;
    height:2.5rem;
    overflow:hidden;
    padding:10px;
    background: var(--c-bg-1);
    border: 1px solid var(--c-border);
    transition: all 0.2s ease;
    text-decoration: none;

    // 深色主题下的样式
    @media (prefers-color-scheme: dark) {
      background: rgba(30, 30, 30, 0.8);
      border-color: rgba(80, 80, 80, 0.5);
    }

    &:hover {
      border-color: var(--c-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:hover .article-title {
      color:var(--c-text);
    }

    .article-author {
      color:var(--c-text-3);
      font-size:.85rem;
      flex-shrink: 0;
    }

    .article-title {
      color:var(--c-text-2);
      flex:1;
      font-size:.9375rem;
      overflow:hidden;
      text-overflow:ellipsis;
      transition:color .2s;
      white-space:nowrap;
    }

    .article-date {
      color:var(--c-text-3);
      font-family:var(--font-monospace);
      font-size:.75rem;
      flex-shrink: 0;
    }
  }

  .random-article .refresh-btn {
    align-items:center;
    border-radius:8px;
    box-shadow:0 0 0 1px var(--c-bg-soft);
    color:var(--c-text-2);
    cursor:pointer;
    display:flex;
    flex-shrink:0;
    height:2.5rem;
    justify-content:center;
    transition:all .2s ease;
    width:2.5rem;
    background: var(--c-bg-1);
    border: none;
  }

  .random-article .refresh-btn:hover {
    background: var(--c-bg-soft);
    color: var(--c-text);
  }

  .articles-list {
    display:flex;
    flex-direction:column;
    gap:.5rem;
  }
}

// 文章项样式
.article-item {
  align-items:center;
  display:flex;
  gap:10px;
  width:100%;
  transition: transform 0.2s ease;

  &.new-item {
    animation:float-in .2s var(--delay) backwards;
  }

  &:hover {
    transform: translateY(-1px);
  }

  .article-image {
    border-radius:50%;
    box-shadow:0 0 0 1px var(--c-bg-soft);
    display:flex;
    flex-shrink:0;
    height:2rem;
    overflow:hidden;
    width:2rem;

    img {
      height:100%;
      object-fit:cover;
      opacity:.8;
      transition:all .2s;
      width:100%;
    }

    &:hover img {
      opacity: 0.9;
    }
  }

  .article-container {
    align-items:center;
    border-radius:8px;
    box-shadow:0 0 0 1px var(--c-bg-soft);
    display:flex;
    gap:5px;
    height:2.5rem;
    overflow:hidden;
    padding:10px;
    width:100%;
    background: var(--c-bg-1);
    border: 1px solid var(--c-border);
    transition: all 0.2s ease;
    text-decoration: none;
    position: relative;

    // 深色主题下的样式
    @media (prefers-color-scheme: dark) {
      background: rgba(30, 30, 30, 0.8);
      border-color: rgba(80, 80, 80, 0.5);
    }

    &:hover {
      border-color: var(--c-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    &:hover .article-title {
      color:var(--c-text);
    }

    .article-author {
      color:var(--c-text-3);
      font-size:.85rem;
      flex-shrink: 0;
    }

    .article-title {
      color:var(--c-text-2);
      flex:1;
      font-size:.9375rem;
      overflow:hidden;
      text-overflow:ellipsis;
      transition:color .2s;
      white-space:nowrap;
    }

    .article-date {
      color:var(--c-text-3);
      font-family:var(--font-monospace);
      font-size:.75rem;
      flex-shrink: 0;
    }
  }
}

// 加载更多按钮
.load-more-container {
  text-align: center;
  margin: 2rem 0;
}

.load-more {
  background-color:var(--ld-bg-card);
  border-radius:8px;
  box-shadow:.1em .2em .5rem var(--ld-shadow);
  display:block;
  font-size:.875rem;
  height:42px;
  margin:1rem auto;
  padding:.75rem;
  width:200px;
  border: 1px solid var(--c-border);
  color: var(--c-text-2);
  cursor: pointer;
  transition: all 0.2s ease;

  // 深色主题下的样式优化
  @media (prefers-color-scheme: dark) {
    background: rgba(40, 40, 40, 0.9);
    border-color: rgba(80, 80, 80, 0.5);
    color: var(--c-text);
  }

  &:hover {
    color:var(--c-text);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border-color: var(--c-primary);
  }
}

// 骨架屏样式
.skeleton-avatar,
.skeleton-text {
  animation:pulse 1.5s infinite;
  background:var(--c-bg-soft);
}

.skeleton-avatar {
  outline:1px solid var(--c-border);
}

.skeleton-text {
  border-radius:4px;
  height:.875rem;
}

.skeleton {
  .article-author {
    width:60px;
  }

  .article-title {
    flex:1;
    margin:0 10px;
  }

  .article-date {
    width:80px;
  }
}

.skeleton-load-more {
  animation:pulse 1.5s infinite;
  background:var(--c-bg-soft);
  box-shadow:none;
}

// 模态框样式
.modal {
  align-items:center;
  backdrop-filter:blur(20px);
  display:flex;
  top:0;
  right:0;
  bottom:0;
  left:0;
  justify-content:center;
  position:fixed;
  z-index:100;
  background: rgba(0, 0, 0, 0.3);
}

.modal .modal-content {
  background-color:var(--c-bg-a50);
  border-radius:12px;
  box-shadow:0 0 0 1px var(--c-bg-soft);
  max-height:80vh;
  max-width:500px;
  overflow-y:auto;
  padding:1.25rem;
  position:relative;
  width:90%;
  background: var(--c-bg-1);
  backdrop-filter: blur(20px);

  @media (prefers-color-scheme: dark) {
    background: rgba(30, 30, 30, 0.95);
    border-color: rgba(80, 80, 80, 0.5);
  }
}

.modal .modal-content .modal-header {
  align-items:center;
  border-bottom:1px solid var(--c-bg-soft);
  display:flex;
  gap:15px;
  margin-bottom:20px;
  padding-bottom:15px;

  img.modal-avatar-img {
    border-radius:50%;
    height:50px;
    object-fit:cover;
    width:50px;
  }

  h3 {
    flex:1;
    font-size:1.2rem;
    margin:0;
    color: var(--c-text);
  }

  .author-link {
    border-radius:8px;
    color:var(--c-text-2);
    padding:8px;
    transition:all .3s;

    &:hover {
      background:var(--c-bg-soft);
      color:var(--c-text);
    }
  }
}

.modal .modal-content .modal-body .timeline {
  position:relative;

  &::after {
    background-color:var(--c-bg-soft);
    bottom:0;
    content:"";
    left:.25rem;
    position:absolute;
    top:.5rem;
    transform:translate(-50%);
    width:2px;
  }

  .timeline-item {
    animation:slideIn .3s ease-out both;
    color:var(--c-text-2);
    padding:0 0 1rem 1.25rem;
    position:relative;

    &::before {
      background-color:var(--c-text-2);
      border-radius:50%;
      content:"";
      height:.5rem;
      left:.25rem;
      position:absolute;
      top:.5rem;
      transform:translateY(-50%) translate(-50%);
      transition:transform .3s ease,box-shadow .3s ease;
      width:.5rem;
      z-index:1;
    }

    &:hover::before {
      box-shadow:0 0 8px var(--c-text-2);
      transform:translateY(-50%) translate(-50%) scale(1.5);
    }

    .date {
      color:var(--c-text-3);
      display:block;
      font-family:var(--font-monospace);
      font-size:.875rem;
      margin-bottom:.3rem;
    }

    .article-title {
      color:var(--c-text-2);
      line-height:1.4;
      transition:color .3s;
      text-decoration: none;
      display: block;
      font-weight: 500;

      &:hover {
        color:var(--c-text);
      }
    }
  }
}

.modal .modal-content .modal-avatar {
  border-radius:50%;
  bottom:1.25rem;
  filter:blur(5px);
  height:128px;
  opacity:.6;
  overflow:hidden;
  pointer-events:none;
  position:absolute;
  right:1.25rem;
  width:128px;
  z-index:1;

  img {
    height:100%;
    object-fit:cover;
    width:100%;
  }
}

// 动画定义
@keyframes pulse {
  0% {
    opacity:1;
  }
  50% {
    opacity:.5;
  }
  to {
    opacity:1;
  }
}

@keyframes slideIn {
  0% {
    opacity:0;
    transform:translateY(20px);
  }
  to {
    opacity:1;
    transform:translateY(0);
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

// 模态框动画
.modal-enter-active,
.modal-enter-active .modal-content,
.modal-leave-active,
.modal-leave-active .modal-content {
  transition:all .3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity:0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform:translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
  opacity:1;
}

.modal-enter-to .modal-content,
.modal-leave-from .modal-content {
  transform:translateY(0);
}

// 响应式设计
@media (max-width:768px) {
  .random-article .random-title {
    display:none;
  }

  .page-fcircle {
    margin: 0.5rem;
  }

  // 响应式调整统计卡片
  .stats-container {
    flex-direction: column;
    gap: 0.8rem;
  }

  .stat-card {
    padding: 0.8rem;
  }

  .page-fcircle .article-item .article-container {
    flex-wrap:wrap;
    height:auto;

    .article-author {
      flex-grow:1;
    }

    .article-title {
      flex-basis:100%;
      order:3;
      white-space:normal;
      margin-top: 0.3rem;
    }
  }

  .page-fcircle .skeleton .article-title {
    height:1.75rem;
    margin:-1px 0;
  }

  .fcircle-title {
    font-size: 1.3rem;
  }
  
  .fcircle-header {
    padding: 1.2rem;
  }
  
  .load-more {
    width: 100%;
  }
}

// 空状态
.error-container {
  align-items:center;
  color:var(--c-text-2);
  display:flex;
  flex-direction:column;
  gap:12px;
  height:400px;
  justify-content:center;
}

.error-container .error-icon {
  color:var(--c-danger);
  font-size:4rem;
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
  color: var(--c-text-3);
}
</style>
