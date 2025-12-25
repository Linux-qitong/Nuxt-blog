<script setup lang="ts">
import { sort } from 'radash'

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-log'])

const appConfig = useAppConfig()
const title = '标签'
const description = `${appConfig.title}的所有文章标签。`
useSeoMeta({ title, description })

const { data: listRaw } = await useAsyncData('index_posts', () => useArticleIndexOptions(), { default: () => [] })

// 选中的标签
const selectedTag = ref<string>('')

// 计算每个标签对应的文章
const articlesByTag = computed(() => {
	const result: Record<string, any[]> = {}
	const articles = sort(listRaw.value, a => new Date(a.date || 0).getTime(), true)
	for (const article of articles) {
		if (article.tags) {
			for (const tag of article.tags) {
				if (!result[tag]) {
					result[tag] = []
				}
				result[tag].push(article)
			}
		}
	}
	return result
})

// 排序后的标签列表（按文章数量降序）
const sortedTags = computed(() => {
	return Object.keys(articlesByTag.value).sort((a, b) => {
		const aCount = articlesByTag.value[a]?.length || 0
		const bCount = articlesByTag.value[b]?.length || 0
		return bCount - aCount
	})
})

// 根据文章数量计算标签大小的函数
function getTagSize(count: number): string {
	const maxCount = Math.max(...Object.values(articlesByTag.value).map(articles => articles.length))
	const minCount = Math.min(...Object.values(articlesByTag.value).map(articles => articles.length))
	const range = maxCount - minCount
	if (range === 0) return 'medium'
	
	const ratio = (count - minCount) / range
	if (ratio < 0.33) return 'small'
	if (ratio < 0.66) return 'medium'
	return 'large'
}

// 点击标签显示对应文章
function handleTagClick(tag: string) {
	selectedTag.value = tag
	// 滚动到页面顶部
	window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 取消选中标签，返回标签云视图
function clearSelectedTag() {
	selectedTag.value = ''
}
</script>

<template>
<div class="tags">
	<!-- 选中标签时显示 -->
	<div v-if="selectedTag" class="tag-selected">
		<div class="tag-selected-header">
			<h1 class="tag-selected-title">
				<span class="tag-hashtag">#</span> {{ selectedTag }}
			</h1>
			<button class="tag-clear-btn" @click="clearSelectedTag" aria-label="返回标签云">
				<Icon name="ph:x-circle-bold" />
			</button>
		</div>
		<div class="tag-selected-info">
			共 {{ articlesByTag[selectedTag]?.length }} 篇文章
		</div>
		
		<menu class="archive-list">
			<TransitionGroup appear name="float-in">
				<PostArchive
					v-for="article, index in articlesByTag[selectedTag]"
					:key="article.path"
					v-bind="article"
					:to="article.path"
					:style="{ '--delay': `${index * 0.03}s` }"
				/>
			</TransitionGroup>
		</menu>
	</div>

	<!-- 标签云视图 -->
	<div v-else class="tag-cloud">
		<h1 class="tag-cloud-title">{{ title }}</h1>
		<div class="tag-cloud-content">
			<button
				v-for="tag in sortedTags"
				:key="tag"
				class="tag-cloud-item gradient-card"
				:class="getTagSize(articlesByTag[tag]?.length)"
				@click="handleTagClick(tag)"
			>
				# {{ tag }}
                <span class="tag-count">{{ articlesByTag[tag]?.length }}</span>
			</button>
		</div>
		
		<div class="tag-cloud-stats">
			共 {{ sortedTags.length }} 个标签
		</div>
	</div>
</div>
</template>

<style lang="scss" scoped>
.tags {
	margin: 1rem;
	padding: 2rem 0;
}

// 标签云样式
.tag-cloud {
	max-width: 800px;
	margin: 0 auto;
}

.tag-cloud-title {
	text-align: center;
	font-size: 2.5rem;
	margin-bottom: 2rem;
	color: var(--c-text);
}

.tag-cloud-content {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	gap: 1rem;
	margin-bottom: 2rem;
}

.tag-cloud-item {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.5rem 1rem;
	border-radius: 2rem;
	background-color: var(--c-bg-2);
	color: var(--c-text);
	cursor: pointer;
	line-height: 1.4;

	&.small {
		font-size: 0.9rem;
	}

	&.medium {
		font-size: 1.1rem;
	}

	&.large {
		font-size: 1.3rem;
		font-weight: 600;
	}
}

.tag-count {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	min-width: 20px;
	height: 20px;
	padding: 0 6px;
	border-radius: 10px;
	background-color: var(--c-bg-3);
	color: var(--c-text-2);
	font-size: 0.8rem;
	font-weight: 500;
}

.tag-cloud-stats {
	text-align: center;
	color: var(--c-text-2);
	font-size: 0.9rem;
	margin-top: 2rem;
}

// 选中标签时的样式
.tag-selected {
	max-width: 800px;
	margin: 0 auto;
}

.tag-selected-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 1rem;
}

.tag-selected-title {
	font-size: 2.5rem;
	font-family: var(--font-creative);
	font-weight: 550;
	color: var(--c-text);
	margin: 0;
}

.tag-hashtag {
	margin-inline-end: 0.1em;
	padding: 0 2px;
	border-radius: 0.2rem;
	background-color: var(--c-primary);
	color: white;
}

.tag-clear-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 40px;
	height: 40px;
	border-radius: 50%;
	background-color: var(--c-bg-2);
	color: var(--c-text-2);
	border: none;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background-color: var(--c-bg-3);
		color: var(--c-text);
		transform: rotate(90deg);
	}
}

.tag-selected-info {
	color: var(--c-text-2);
	font-size: 1rem;
	margin-bottom: 2rem;
	padding-bottom: 1rem;
	border-bottom: 1px solid var(--c-border);
}

.archive-list {
	margin-top: 1.5rem;
}

// 响应式设计
@media (max-width: 768px) {
	.tags {
		margin: 0.5rem;
		padding: 1rem 0;
	}

	.tag-cloud-title,
	.tag-selected-title {
		font-size: 2rem;
	}

	.tag-cloud-item {
		padding: 0.4rem 0.8rem;
		gap: 0.4rem;
	}

	.tag-cloud-item.large {
		font-size: 1.2rem;
	}
}
</style>
