<script setup lang="ts">
import { myFeed } from '~~/blog.config'
import type { FeedEntry } from '~/types/feed'

const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
layoutStore.setAside([])

useSeoMeta({
  title: '博友圈',
  description: `${appConfig.title}的博友圈，展示友链博客的最新文章动态。`,
  ogImage: appConfig.author.avatar,
})

// 获取友链朋友圈文章数据
const { data: circlePosts, refresh: refreshPosts } = await useAsyncData(
  'fcircle_posts',
  async () => {
    try {
      // 从指定的友链朋友圈API获取数据
      const response = await fetch('https://fc.linux-qitong.top/all.json')
      const data = await response.json()
      
      // 适配数据格式
      const formattedArticles = data.article_data.map((item: any) => ({
        id: item.link + Math.random(), // 确保唯一ID
        author: item.author,
        title: item.title,
        link: item.link,
        pubDate: item.created,
        avatar: item.avatar
      }))
      
      // 按博主分组文章，用于点击头像时显示该博主的所有文章
      const articlesByAuthor = formattedArticles.reduce((acc: Record<string, typeof formattedArticles>, article) => {
        if (!acc[article.author]) {
          acc[article.author] = []
        }
        acc[article.author].push(article)
        return acc
      }, {})
      
      return {
        articles: formattedArticles,
        statistical_data: data.statistical_data,
        // 随机选择一篇文章
        randomArticle: formattedArticles.length > 0 
          ? formattedArticles[Math.floor(Math.random() * formattedArticles.length)] 
          : null,
        articlesByAuthor: articlesByAuthor
      }
    } catch (error) {
      console.error('获取博友圈数据失败:', error)
      // 如果获取失败，返回空数据
      return {
        articles: [],
        statistical_data: {
          friends_num: 0,
          active_num: 0,
          error_num: 0,
          article_num: 0,
          last_updated_time: new Date().toLocaleString('zh-CN')
        },
        randomArticle: null,
        articlesByAuthor: {}
      }
    }
  },
  { default: () => ({ articles: [], statistical_data: null, randomArticle: null, articlesByAuthor: {} }) }
)

// 刷新随机文章
function refreshRandomArticle() {
  if (circlePosts.articles.length > 0) {
    const randomIndex = Math.floor(Math.random() * circlePosts.articles.length)
    // 简单处理：替换随机文章
    circlePosts.randomArticle = circlePosts.articles[randomIndex]
  }
}

// 加载更多（模拟功能）
function loadMore() {
  // 实际实现可能需要分页加载
  console.log('加载更多文章')
}

// 格式化时间
function formatPubDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-') // 将斜杠替换为连字符
}

// 头像弹窗相关状态
const showAvatarPopup = ref(false)
const selectedAuthor = ref('')
const popupPosition = ref({ x: 0, y: 0 })

// 显示头像弹窗
function showAvatarPosts(author: string, event: MouseEvent) {
  selectedAuthor.value = author
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  popupPosition.value = {
    x: rect.left + window.scrollX,
    y: rect.bottom + window.scrollY + 10
  }
  showAvatarPopup.value = true
  
  // 添加点击外部关闭弹窗的事件监听
  setTimeout(() => {
    document.addEventListener('click', closeAvatarPopupOnOutsideClick)
  }, 0)
}

// 关闭头像弹窗
function closeAvatarPopup() {
  showAvatarPopup.value = false
  document.removeEventListener('click', closeAvatarPopupOnOutsideClick)
}

// 点击外部关闭弹窗
function closeAvatarPopupOnOutsideClick(event: MouseEvent) {
  const popup = document.getElementById('avatar-popup')
  if (popup && !popup.contains(event.target as Node)) {
    closeAvatarPopup()
  }
}
</script>

<template>
<div class="mobile-only">
  <ZhiluHeader to="/" suffix="博友圈" />
</div>

<div class="fcircle-container">
  <!-- 顶部绿色标题区域 -->
  <div class="fcircle-header">
    <h1 class="fcircle-title">博友圈</h1>
    <p class="fcircle-subtitle">叮！能量已加满</p>
    <!-- 进度条 -->
    <div class="energy-bar">
      <div class="energy-progress"></div>
      <div class="energy-labels">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
    <!-- 发现更多区域 -->
    <div class="discover-section">
      <span class="discover-text">发现更多有趣的博主</span>
      <div class="header-info">
        <span class="update-time">Updated at {{ circlePosts.statistical_data?.last_updated_time || '' }}</span>
        <span class="powered-by">Powered by FriendCircleLite</span>
      </div>
    </div>
  </div>

  <!-- 随机文章区域 -->
  <div v-if="circlePosts.randomArticle" class="random-article-section">
    <div class="random-article-header">
      <span class="random-label">随机文章</span>
      <button 
        class="refresh-random-btn" 
        @click="refreshRandomArticle"
        title="刷新随机文章"
      >
        <Icon name="ph:refresh-bold" size="16" />
      </button>
    </div>
    <div class="random-article-wrapper">
      <img 
        :src="circlePosts.randomArticle.avatar" 
        :alt="circlePosts.randomArticle.author"
        class="random-article-avatar"
        @click.stop="showAvatarPosts(circlePosts.randomArticle.author, $event)"
        style="cursor: pointer;"
      />
      <div class="random-article-content">
        <div class="random-article-author">{{ circlePosts.randomArticle.author }}</div>
        <a 
          :href="circlePosts.randomArticle.link" 
          target="_blank" 
          rel="noopener noreferrer"
          class="random-article"
        >
          {{ circlePosts.randomArticle.title }}
        </a>
        <div class="random-article-date">{{ formatPubDate(circlePosts.randomArticle.pubDate) }}</div>
      </div>
    </div>
  </div>

  <!-- 文章列表 -->
  <div class="articles-container">
    <TransitionGroup name="fade-in" tag="div" class="articles-list">
      <a 
        v-for="(article, index) in circlePosts.articles"
        :key="article.id"
        :href="article.link"
        target="_blank"
        rel="noopener noreferrer"
        class="article-item"
      >
        <img 
          :src="article.avatar" 
          :alt="article.author"
          class="article-avatar"
          @click.stop="showAvatarPosts(article.author, $event)"
          style="cursor: pointer;"
        />
        <div class="article-info">
          <div class="article-header">
            <span class="article-author">{{ article.author }}</span>
            <span class="article-date">{{ formatPubDate(article.pubDate) }}</span>
          </div>
          <div class="article-title">{{ article.title }}</div>
        </div>
      </a>
    </TransitionGroup>
  </div>

  <!-- 加载更多按钮 -->
  <div v-if="circlePosts.articles.length > 0" class="load-more-container">
    <button class="load-more-btn" @click="loadMore">加载更多</button>
  </div>

  <!-- 空状态 -->
  <div v-if="circlePosts.articles.length === 0" class="empty-state">
    <Icon name="ph:file-text-off-bold" size="4rem" />
    <p>暂无文章数据</p>
    <p class="empty-hint">请稍后再试</p>
  </div>

  <!-- 头像点击弹窗 -->
  <div 
    v-if="showAvatarPopup && selectedAuthor && circlePosts.articlesByAuthor[selectedAuthor]"
    id="avatar-popup"
    class="avatar-popup"
    :style="{
      left: popupPosition.x + 'px',
      top: popupPosition.y + 'px'
    }"
  >
    <div class="popup-header">
      <img 
        :src="circlePosts.articlesByAuthor[selectedAuthor][0].avatar" 
        :alt="selectedAuthor"
        class="popup-avatar"
      />
      <div class="popup-author-info">
        <div class="popup-author-name">{{ selectedAuthor }}</div>
        <div class="popup-article-count">{{ circlePosts.articlesByAuthor[selectedAuthor].length }} 篇文章</div>
      </div>
    </div>
    <div class="popup-articles">
      <a 
        v-for="(article, index) in circlePosts.articlesByAuthor[selectedAuthor].slice(0, 5)"
        :key="article.id"
        :href="article.link"
        target="_blank"
        rel="noopener noreferrer"
        class="popup-article-item"
      >
        <div class="popup-article-date">{{ formatPubDate(article.pubDate) }}</div>
        <div class="popup-article-title">{{ article.title }}</div>
      </a>
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
.fcircle-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  position: relative;
}

/* 顶部绿色标题区域 */
.fcircle-header {
  background: #4CAF50;
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
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
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  position: relative;
}

.fcircle-subtitle {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  opacity: 0.9;
  position: relative;
}

/* 能量条 */
.energy-bar {
  width: 80%;
  max-width: 400px;
  margin: 0 auto 1rem;
  position: relative;
}

.energy-progress {
  height: 8px;
  background: #8BC34A;
  border-radius: 4px;
  width: 70%; /* 示例进度 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.energy-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  opacity: 0.8;
}

/* 发现更多区域 */
.discover-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  opacity: 0.8;
  position: relative;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.header-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.discover-text {
  font-weight: 500;
}

.update-time {
  font-size: 0.8rem;
}

.powered-by {
  font-size: 0.75rem;
}

/* 随机文章区域 - 样式调整 */
.random-article-section {
  background: white;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.random-article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  color: #666;
}

.random-label {
  font-weight: 500;
  font-size: 0.95rem;
}

.refresh-random-btn {
  background: white;
  border: 1px solid #ddd;
  cursor: pointer;
  color: #666;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  transition: all 0.2s;
  
  &:hover {
    background: #e8f5e9;
    border-color: #4CAF50;
    color: #4CAF50;
  }
}

/* 随机文章内容 - 调整为与参考图一致 */
.random-article-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.5rem 0;
}

.random-article-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #f0f0f0;
}

.random-article-content {
  flex: 1;
  min-width: 0;
}

.random-article-author {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.4rem;
}

.random-article {
  display: block;
  color: #333;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  transition: color 0.2s;
  line-height: 1.4;
  margin-bottom: 0.3rem;
  
  &:hover {
    color: #4CAF50;
  }
}

.random-article-date {
  font-size: 0.8rem;
  color: #999;
}

/* 文章列表 */
.articles-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.article-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
  
  &:hover {
    background: #f9f9f9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    border-color: #e0e0e0;
  }
}

.article-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #f0f0f0;
}

.article-info {
  flex: 1;
  min-width: 0;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.article-author {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.article-date {
  font-size: 0.8rem;
  color: #999;
}

.article-title {
  font-size: 1rem;
  color: #333;
  line-height: 1.4;
  word-break: break-word;
  font-weight: 500;
}

/* 加载更多按钮 */
.load-more-container {
  text-align: center;
  margin: 2rem 0;
}

.load-more-btn {
  padding: 0.8rem 2.5rem;
  background: white;
  color: #4CAF50;
  border: 1px solid #4CAF50;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: #4CAF50;
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: #999;
}

.empty-hint {
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-enter-active {
  animation: fadeIn 0.3s ease-out;
}

.fade-in-leave-active {
  animation: fadeIn 0.3s ease-in reverse;
}

/* 头像弹窗样式 */
.avatar-popup {
  position: fixed;
  width: 320px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  border: 1px solid #e0e0e0;
  z-index: 1000;
  max-height: 400px;
  overflow: hidden;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.popup-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.popup-author-info {
  flex: 1;
  min-width: 0;
}

.popup-author-name {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.2rem;
}

.popup-article-count {
  font-size: 0.8rem;
  color: #999;
}

.popup-articles {
  max-height: 300px;
  overflow-y: auto;
}

.popup-article-item {
  display: block;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
}

.popup-article-date {
  font-size: 0.75rem;
  color: #999;
  margin-bottom: 0.3rem;
}

.popup-article-title {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.3;
  word-break: break-word;
}

/* 响应式设计 */
@media (max-width: $breakpoint-phone) {
  .fcircle-header {
    padding: 1.5rem;
  }
  
  .fcircle-title {
    font-size: 1.75rem;
  }
  
  .discover-section {
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .header-info {
    align-items: center;
  }
  
  .update-time, .powered-by {
    font-size: 0.8rem;
  }
  
  .article-item {
    padding: 0.75rem;
  }
  
  .article-avatar {
    width: 2.5rem;
    height: 2.5rem;
  }
  
  .article-title {
    font-size: 0.95rem;
  }
  
  .load-more-btn {
    padding: 0.75rem 2rem;
    width: 100%;
  }
}
</style>