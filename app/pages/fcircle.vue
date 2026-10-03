<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'

const title = '朋友圈'
const description = '发现更多有趣的博主。'
const image = 'https://图片链接'
useSeoMeta({ title, description, ogImage: image })

// 配置选项
const UserConfig = reactive({
  api_url: 'https://轻量朋友圈/',
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
<template #aside>
	<WidgetBlogStats />
	<WidgetBlogTech />
	<WidgetBlogLog />
</template>

  <ZPageBanner :title :description :image>
    <div class="stats-bar">
      <div class="stats-update-time">Updated at {{ lastUpdatedDate || '2025-07-17' }}</div>
      <div class="stats-powered-by">Powered by FriendCircleLite</div>
    </div>
  </ZPageBanner>

  <div class="page-fcircle">
    <div class="fcircle">
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
        <ZButton 
          class="refresh-btn gradient-card" 
          @click="refreshRandomArticle"
          icon="uim:process"
        />
      </div>

      <!-- 文章列表区域 -->
      <div class="articles-list">
        <div
          v-for="(article, index) in displayedArticles"
          :key="article.id"
          class="article-item new-item"
          :style="{ '--delay': `${(index % UserConfig.page_size) * 0.05}s` }"
        >
          <div class="article-image" @click="showAvatarPosts(article.author, article.avatar, article.link)">
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
            class="article-container gradient-card"
          >
            <span class="article-author">{{ article.author }}</span>
            <span class="article-title">{{ article.title }}</span>
            <span class="article-date">{{ formatDate(article.created) }}</span>
          </a>
        </div>
      </div>

      <!-- 加载更多按钮 -->
      <ZButton 
        v-show="hasMoreArticles" 
        class="load-more gradient-card"
        @click="loadMore"
        text="加载更多"
      />

      <!-- 空状态 -->
      <div v-if="!isLoading && allArticles.length === 0" class="error-container">
        <Icon class="error-icon" name="tabler:file-alert" />
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
              <NuxtImg 
                :src="selectedAuthorAvatar" 
                :alt="selectedAuthor"
                loading="lazy"
              />
              <h3>{{ selectedAuthor }}</h3>
              <a 
                :href="selectedArticleLink" 
                target="_blank"
                rel="noopener noreferrer"
                class="author-link"
              >
                <Icon name="lucide:external-link" />
              </a>
            </div>
            <div class="modal-body">
              <div class="timeline">
                <div 
                  v-for="(article, index) in articlesByAuthor[selectedAuthor].slice(0, 10)"
                  :key="article.id"
                  class="timeline-item"
                  :style="{ '--delay': (0.2 + index * 0.1) + 's' }"
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

<style scoped>
.stats-bar {
	align-items: flex-end;
	color: #eee;
	display: flex;
	flex-direction: column;
	font-family: var(--font-monospace);
	font-size: .7rem;
	gap: .1rem;
	opacity: .7;
	text-shadow: 0 4px 5px rgba(0, 0, 0, .5);

	.stats-update-time {
		opacity: 1;
	}

	.stats-powered-by {
		opacity: .8;
	}
}

.page-fcircle {
	animation: float-in .2s backwards;
	margin: 1rem;

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

				.article-author,
				.article-date {
					flex-shrink: 0;
				}
			}
		}

		.refresh-btn {
			align-items: center;
			background-color: unset;
			border-radius: 8px;
			box-shadow: none;
			color: var(--c-text-2);
			cursor: pointer;
			display: flex;
			flex-shrink: 0;
			height: 2.5rem;
			justify-content: center;
			transition: all .2s ease;
			width: 2.5rem;

			&:hover {
				background-color: unset;
			}
		}
	}

	.articles-list {
		display: flex;
		flex-direction: column;
		gap: .5rem;
	}
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
		overflow: hidden;
		padding: 10px;
		width: 100%;

		&:hover .article-title {
			color: var(--c-text);
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

/* 模态框样式 */
.modal {
	align-items: center;
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	display: flex;
	inset: 0;
	justify-content: center;
	position: fixed;
	z-index: 900;

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
					animation: slideIn .3s ease-out both;
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
				object-fit: cover;
				width: 100%;
			}
		}
	}
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

/* 模态框过渡 */
.modal-enter-active,
.modal-enter-active .modal-content,
.modal-leave-active,
.modal-leave-active .modal-content {
	transition: all .3s ease;
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

.loading-container {
	align-items: center;
	color: var(--c-text-2);
	display: flex;
	flex-direction: column;
	gap: 12px;
	height: 500px;
	justify-content: center;

	.loading-spinner {
		animation: spin 1s linear infinite;
		border: 3px solid var(--c-bg-3);
		border-radius: 50%;
		border-top-color: var(--c-primary);
		height: 40px;
		width: 40px;
	}
}

/* 错误容器 */
.error-container {
	align-items: center;
	color: var(--c-text-2);
	display: flex;
	flex-direction: column;
	gap: 12px;
	height: 500px;
	justify-content: center;

	.error-icon {
		color: var(--c-danger);
		font-size: 4rem;
	}
}

@keyframes spin {
	to {
		transform: rotate(1turn);
	}
}

/* 移动端适配 */
@media (max-width: 768px) {
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
	}
}
</style>
