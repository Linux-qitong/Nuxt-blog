<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'comm-group'])

const title = '朋友圈'
const description = '发现更多有趣的博主。'
const image = 'https://bu.dusays.com/2025/02/18/67b46c6d8c9f1.webp'
useSeoMeta({ title, description, ogImage: image })

// 配置选项
const UserConfig = reactive({
  api_url: 'https://fc.linux-qitong.top/',
  page_size: 20
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
const displayedArticles = computed(() => allArticles.value.slice(0, displayCount.value))
const hasMoreArticles = computed(() => allArticles.value.length > displayCount.value)

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  
  return toZdtLocaleString(dateString, 'date').replace(/\//g, '-')
}

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

// 模态框相关
const showAvatarPosts = (author, avatar, articleLink) => {
  selectedAuthor.value = author
  selectedAuthorAvatar.value = avatar
  selectedArticleLink.value = articleLink
  showAvatarPopup.value = true
}

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
      avatar: item.avatar
    }))
    
    // 按作者分组
    articlesByAuthor.value = allArticles.value.reduce((acc, article) => {
      if (!acc[article.author]) acc[article.author] = []
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

// 生命周期钩子
onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <ZPageBanner :title :description :image>
    <div class="fcircle-stats">
      <div class="fcircle-stats__update-time">Updated at {{ lastUpdatedDate || '2025-07-17' }}</div>
      <div class="fcircle-stats__powered-by">Powered by FriendCircleLite</div>
    </div>
  </ZPageBanner>

  <div class="page-fcircle">
    <div class="fcircle">
      <!-- 随机文章区域 -->
      <div v-if="randomArticle" class="fcircle__random-article">
        <div class="fcircle__random-title">随机文章</div>
        <div class="article-item">
          <a 
            :href="randomArticle.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-item__container gradient-card"
          >
            <span class="article-item__author">{{ randomArticle.author }}</span>
            <span class="article-item__title">{{ randomArticle.title }}</span>
            <span class="article-item__date">{{ formatDate(randomArticle.created) }}</span>
          </a>
        </div>
        <ZButton 
          class="btn-refresh gradient-card" 
          @click="refreshRandomArticle"
          icon="uim:process"
        />
      </div>

      <!-- 文章列表区域 -->
      <div class="fcircle__articles">
        <div
          v-for="(article, index) in displayedArticles"
          :key="article.id"
          class="article-item article-item--new"
          :style="{ '--delay': `${(index % UserConfig.page_size) * 0.05}s` }"
        >
          <div class="article-item__image" @click="showAvatarPosts(article.author, article.avatar, article.link)">
            <NuxtImg 
              :src="article.avatar" 
              :alt="article.author"
              loading="lazy"
            />
          </div>
          <a
            :href="article.link"
            target="_blank"
            rel="noopener noreferrer"
            class="article-item__container gradient-card"
          >
            <span class="article-item__author">{{ article.author }}</span>
            <span class="article-item__title">{{ article.title }}</span>
            <span class="article-item__date">{{ formatDate(article.created) }}</span>
          </a>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <ZButton 
        v-show="hasMoreArticles" 
        class="btn-load-more gradient-card"
        @click="loadMore"
        text="加载更多"
      />

      <!-- 空状态 -->
      <div v-if="!isLoading && allArticles.length === 0" class="error-container">
        <Icon class="error-container__icon" name="ph:file-text-bold" />
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
          <div class="modal__content" @click.stop>
            <div class="modal__header">
              <NuxtImg 
                :src="selectedAuthorAvatar" 
                :alt="selectedAuthor"
                loading="lazy"
                class="modal__avatar-img"
              />
              <h3>{{ selectedAuthor }}</h3>
              <a 
                :href="selectedArticleLink" 
                target="_blank"
                rel="noopener noreferrer"
                class="modal__author-link"
              >
                <Icon name="lucide:external-link" />
              </a>
            </div>
            <div class="modal__body">
              <div class="timeline">
                <div 
                  v-for="(article, index) in articlesByAuthor[selectedAuthor].slice(0, 10)"
                  :key="article.id"
                  class="timeline__item"
                  :style="{ '--delay': (0.2 + index * 0.1) + 's' }"
                >
                  <span class="timeline__date">{{ formatDate(article.created) }}</span>
                  <a 
                    :href="article.link"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="timeline__title"
                    @click="closeAvatarPopup"
                  >
                    {{ article.title }}
                  </a>
                </div>
              </div>
            </div>
            <div class="modal__avatar">
              <NuxtImg 
                :src="selectedAuthorAvatar" 
                :alt="selectedAuthor"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 动画定义 */
@keyframes pulse-fade {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slide-in-up {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 主要样式 */
.page-fcircle {
  animation: float-in .2s backwards;
  margin: 1rem;
}

.fcircle-stats {
  align-items: flex-end;
  color: #eee;
  display: flex;
  flex-direction: column;
  font-family: var(--font-monospace);
  font-size: .7rem;
  gap: .1rem;
  opacity: .7;
  text-shadow: 0 4px 5px rgba(0,0,0,.5);
  
  .fcircle-stats__update-time { opacity: 1; }
  .fcircle-stats__powered-by { opacity: .8; }
}

.fcircle {
  .fcircle__random-article {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 10px;
    justify-content: space-between;
    margin: 1rem 0;
    
    .fcircle__random-title {
      font-size: 1.2rem;
      white-space: nowrap;
    }
    
    .article-item {
      flex: 1;
      min-width: 0;
      
      .article-item__container {
        min-width: 0;
        
        .article-item__title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
  
  .fcircle__articles {
    display: flex;
    flex-direction: column;
    gap: .5rem;
  }
}

/* 文章项样式 */
.article-item {
  align-items: center;
  display: flex;
  gap: 10px;
  width: 100%;
  
  &.article-item--new { animation: float-in .2s var(--delay) backwards; }
  
  .article-item__image {
    border-radius: 50%;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    flex-shrink: 0;
    height: 2rem;
    overflow: hidden;
    width: 2rem;
    
    img {
      height: 100%;
      object-fit: cover;
      opacity: .8;
      transition: all .2s;
      width: 100%;
    }
  }
  
  .article-item__container {
    align-items: center;
    border-radius: 8px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    display: flex;
    gap: 5px;
    height: 2.5rem;
    overflow: hidden;
    padding: 10px;
    width: 100%;
    
    &:hover .article-item__title { color: var(--c-text); }
    
    .article-item__author {
      color: var(--c-text-3);
      font-size: .85rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    
    .article-item__title {
      color: var(--c-text-2);
      flex: 1;
      font-size: .9375rem;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color .2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
    }
    
    .article-item__date {
      color: var(--c-text-3);
      font-family: var(--font-monospace);
      font-size: .75rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
  }
}

/* 按钮样式 */
.btn-refresh {
  align-items: center;
  background-color: unset;
  border-radius: 8px;
  color: var(--c-text-2);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 2.5rem;
  justify-content: center;
  transition: all .2s ease;
  width: 2.5rem;
  box-shadow: none; 
  
  &:hover { 
    background-color: unset;
  }
}

.btn-load-more {
  background-color: var(--ld-bg-card);
  border-radius: 8px;
  box-shadow: .1em .2em .5rem var(--ld-shadow);
  display: block;
  font-size: .875rem;
  height: 42px;
  margin: 1rem auto;
  padding: .75rem;
  width: 200px;
  
  &:hover { color: var(--c-text); }
}

/* 模态框样式 */
.modal {
  align-items: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  justify-content: center;
  position: fixed;
  z-index: 100;
  
  .modal__content {
    background-color: var(--c-bg-a50);
    border-radius: 12px;
    box-shadow: 0 0 0 1px var(--c-bg-soft);
    max-height: 80vh;
    max-width: 500px;
    overflow-y: auto;
    padding: 1.25rem;
    position: relative;
    width: 90%;
    
    .modal__header {
      align-items: center;
      border-bottom: 1px solid var(--c-bg-soft);
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      padding-bottom: 15px;
      
      img { border-radius: 50%; height: 50px; object-fit: cover; width: 50px; }
      h3 { flex: 1; font-size: 1.2rem; margin: 0; }
      
      .modal__author-link {
        border-radius: 8px;
        color: var(--c-text-2);
        padding: 8px;
        transition: all .3s;
        
        &:hover { background: var(--c-bg-soft); color: var(--c-text); }
      }
    }
    
    .modal__body {
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
        
        .timeline__item {
          animation: float-in .3s var(--delay) backwards;
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
            transition: transform .3s ease, box-shadow .3s ease;
            width: .5rem;
            z-index: 1;
          }
          
          &:hover:before {
            box-shadow: 0 0 8px var(--c-text-2);
            transform: translateY(-50%) translate(-50%) scale(1.5);
          }
          
          .timeline__date {
            color: var(--c-text-3);
            display: block;
            font-family: var(--font-monospace);
            font-size: .875rem;
            margin-bottom: .3rem;
          }
          
          .timeline__title {
            color: var(--c-text-2);
            line-height: 1.4;
            transition: color .3s;
            
            &:hover { color: var(--c-text); }
          }
        }
      }
    }
    
    .modal__avatar {
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
      
      img { height: 100%; object-fit: cover; width: 100%; }
    }
  }
}

/* 模态框过渡 */
.modal-enter-active,
.modal-enter-active .modal__content,
.modal-leave-active,
.modal-leave-active .modal__content {
  transition: all .3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal__content,
.modal-leave-to .modal__content {
  transform: translateY(-20px);
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

.modal-enter-to .modal__content,
.modal-leave-from .modal__content {
  transform: translateY(0);
}

/* 错误容器 */
.error-container {
  align-items: center;
  color: var(--c-text-2);
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 400px;
  justify-content: center;
  
  .error-container__icon { font-size: 4rem; }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .fcircle__random-article .fcircle__random-title { display: none; }
  
  .page-fcircle .article-item .article-item__container {
    flex-wrap: wrap;
    height: auto;
  }
  
  .page-fcircle .article-item .article-item__container .article-item__author {
    flex-grow: 1;
  }
  
  .page-fcircle .article-item .article-item__container .article-item__title {
    flex-basis: 100%;
    order: 3;
    white-space: normal;
  }
}
</style>
