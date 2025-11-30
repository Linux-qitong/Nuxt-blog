<script setup lang="ts">
import { sort } from 'radash'

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'comm-group'])

const appConfig = useAppConfig()
const title = '标签'
const description = `${appConfig.title}的所有文章标签。`
useSeoMeta({ title, description })

const { data: listRaw } = await useAsyncData('index_posts', () => useArticleIndexOptions(), { default: () => [] })

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

const sortedTags = computed(() => {
	return Object.keys(articlesByTag.value).sort((a, b) => {
		const aCount = articlesByTag.value[a]?.length || 0
		const bCount = articlesByTag.value[b]?.length || 0
		return bCount - aCount
	})
})
</script>

<template>
<div class="tags">
	<section
		v-for="tag in sortedTags"
		:key="tag"
		class="tag-group"
	>
		<div class="tag-title text-creative">
			<h2 class="tag-name">
				{{ tag }}
			</h2>
			<div class="tag-info">
				<span>{{ articlesByTag[tag]?.length }}篇</span>
			</div>
		</div>

		<menu class="archive-list">
			<TransitionGroup appear name="float-in">
				<PostArchive
					v-for="article, index in articlesByTag[tag]"
					:key="article.path"
					v-bind="article"
					:to="article.path"
					:style="{ '--delay': `${index * 0.03}s` }"
				/>
			</TransitionGroup>
		</menu>
	</section>
</div>
</template>

<style lang="scss" scoped>
.tags {
	margin: 1rem;
}

.tag-group {
	margin: 1rem 0 3rem;
}

.tag-title {
	display: flex;
	justify-content: space-between;
	gap: 1em;
	position: sticky;
	opacity: .5;
	top: 0;
	font-size: min(1.5em, 5vw);
	color: transparent;
	transition: color .2s;

	&::selection, :hover > & {
		color: var(--c-text-3);
	}

	> .tag-name {
		margin-bottom: -.3em;
		mask-image: linear-gradient(#FFF 50%, transparent);
		font-size: 3em;
		font-weight: 800;
		line-height: 1;
		z-index: -1;
		-webkit-text-stroke: 1px var(--c-text-3);
	}

	> .tag-info {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		column-gap: .5em;
	}
}
</style>
