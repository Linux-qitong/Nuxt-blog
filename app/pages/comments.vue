<script setup lang="ts">
const title = '留言板'
const description = '您可以在此畅所欲言，当然，请遵守互联网相关的法律法规'
const image = 'https://bu.dusays.com/2025/10/21/68f7083fcc594.webp'
useSeoMeta({ title, description, ogImage: image })
</script>

<template>
<template #aside>
	<WidgetBlogStats />
	<WidgetBlogTech />
	<WidgetBlogLog />
</template>

<ZPageBanner :title :description :image />

<div class="page-comments">
  <Quote>{{ description }}</Quote>

  <Quote icon="tabler:files">
    如果您有什么想说的、想问的，或者发现了本站的小问题🐞欢迎留言
  </Quote>
  
  <Quote icon="tabler:link">
    需要添加友链？请移步<ProseA :href="'/link'" class="link-text">友链</ProseA>页面
  </Quote>
</div>

<PostComment />
</template>

<style scoped>
.page-comments {
  animation: float-in .2s backwards;
  margin: 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;

  .quote {
    max-width: 700px;
    width: 100%;
    color: var(--c-text-2);
    font-size: 1.2rem;
    font-weight: var(--font-weight-medium);
    line-height: 1.5;
    text-align: center;
  }
}

.link-text {
  color: inherit;
  transition: background-size 0.3s ease;

  &:hover {
    color: var(--c-primary);
    text-decoration: none;
    background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat bottom/100% 30%;
  }
}
</style>
