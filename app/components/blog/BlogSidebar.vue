<script setup lang="ts">
const appConfig = useAppConfig()
const layoutStore = useLayoutStore()
const searchStore = useSearchStore()

const route = useRoute()
const openMenuKeys = ref<Record<string, boolean>>({})

const itemKey = (groupIndex: number, itemIndex: number) => `g${groupIndex}-i${itemIndex}`

const hasSubItems = (item: any) => Boolean(item.children && item.children.length)

function isActive(item: any): boolean {
	if (item.url && item.url !== '#' && !isExtLink(item.url) && route.path === item.url)
		return true

	if (item.children?.length)
		return item.children.some(isActive)

	return false
}

const isOpen = (key: string) => Boolean(openMenuKeys.value[key])

function toggleSubMenu(key: string) {
	openMenuKeys.value[key] = !openMenuKeys.value[key]
}

function openActiveMenus() {
	appConfig.nav.forEach((group, groupIndex) => {
		group.items.forEach((item, itemIndex) => {
			if (hasSubItems(item) && isActive(item))
				openMenuKeys.value[itemKey(groupIndex, itemIndex)] = true
		})
	})
}

watch(() => route.path, openActiveMenus, { immediate: true })
</script>

<template>
<BlogMask
	:show="layoutStore.state === 'sidebar'"
	class="hide-above-mobile"
	@click="layoutStore.close()"
/>

<!-- 不能用 Transition 实现弹出收起动画，因为半宽屏状态始终显示 -->
<aside id="blog-sidebar" :class="{ show: layoutStore.state === 'sidebar' }">
	<BlogHeader class="sidebar-header" to="/" />

	<nav class="sidebar-nav scrollcheck-y">
		<div class="search-btn sidebar-nav-item gradient-card" @click="layoutStore.toggle('search')">
			<Icon name="tabler:search" />
			<span class="nav-text">{{ searchStore.label }}</span>
			<Key class="keycut" code="K" cmd prevent @press="layoutStore.toggle('search')" />
		</div>

		<template v-for="(group, groupIndex) in appConfig.nav" :key="groupIndex">
			<h3 v-if="group.title">
				{{ group.title }}
			</h3>

			<menu>
				<li v-for="(item, itemIndex) in group.items" :key="itemIndex">
					<div v-if="hasSubItems(item)">
						<button
							class="sidebar-nav-item sidebar-nav-item-parent"
							:class="{ open: isOpen(itemKey(groupIndex, itemIndex)), active: isActive(item) }"
							type="button"
							@click="toggleSubMenu(itemKey(groupIndex, itemIndex))"
						>
							<span class="nav-text-wrap">
								<Icon :name="item.icon" />
								<span class="nav-text">{{ item.text }}</span>
							</span>
							<Icon :name="isOpen(itemKey(groupIndex, itemIndex)) ? 'tabler:chevron-up' : 'tabler:chevron-down'" />
						</button>

						<ul v-show="isOpen(itemKey(groupIndex, itemIndex))" class="sidebar-subnav">
							<li v-for="(subItem, subIndex) in item.children" :key="subIndex">
								<UtilLink
									:to="subItem.url"
									class="sidebar-nav-item submenu-item"
									:class="{ 'router-link-active': isActive(subItem) }"
								>
									<Icon :name="subItem.icon" />
									<span class="nav-text">{{ subItem.text }}</span>
									<Icon v-if="isExtLink(subItem.url)" class="external-tip" name="tabler:arrow-up-right" />
								</UtilLink>
							</li>
						</ul>
					</div>

					<template v-else>
						<UtilLink :to="item.url" class="sidebar-nav-item" :class="{ 'router-link-active': isActive(item) }">
							<Icon :name="item.icon" />
							<span class="nav-text">{{ item.text }}</span>
							<Icon v-if="isExtLink(item.url)" class="external-tip" name="tabler:arrow-up-right" />
						</UtilLink>
					</template>
				</li>
			</menu>
		</template>
	</nav>

	<footer class="sidebar-footer">
		<BlogThemeToggle />
		<ZIconNavList :list="appConfig.footer.iconNav" />
	</footer>
</aside>
</template>

<style scoped>
#blog-sidebar {
	display: flex;
	flex-direction: column;
	color: var(--c-text-2);

	@media not (max-width: 768px) {
		:root[data-article-transition] & { view-transition-name: article-navigation; }
	}

	&:hover {
		color: currentcolor;
	}

	@media (max-width: 768px) {
		position: fixed;
		inset-inline-start: 0;
		width: 320px;
		max-width: 100%;
		background-color: var(--ld-bg-blur);
		backdrop-filter: blur(0.5rem);
		color: currentcolor;
		transform: var(--transform-start-far);
		transition: transform 0.2s;
		z-index: var(--z-index-popover);

		&.show {
			box-shadow: var(--box-shadow-1), var(--box-shadow-3);
			transform: none;
		}
	}
}

.sidebar-nav {
	flex-grow: 1;
	padding: 0 5%;
	font-size: 0.9em;
	font-family: var(--font-basic);

	h3 {
		margin: 2em 0 1em 1em;
		font-family: var(--font-basic);
		font-size: 1em;
		font-weight: 700;
		color: var(--c-text-2);
	}

	li {
		margin: 0.5em 0;
	}
}

.sidebar-nav-item,
.sidebar-nav-item-parent {
	display: flex;
	align-items: center;
	gap: 0.5em;
	padding: 0.5em 1em;
	border-radius: 0.5em;
	font-family: var(--font-basic);
	transition: all 0.2s;
}

.sidebar-nav-item:not(.search-btn):hover,
.sidebar-nav-item.router-link-active,
.sidebar-nav-item-parent.active,
.sidebar-nav-item-parent:hover {
	background-color: var(--c-bg-soft);
	color: var(--c-text);
}

.sidebar-nav-item:not(.search-btn).router-link-active::after {
	content: "⦁";
	width: 1em;
	text-align: center;
	color: var(--c-text-3);
}

.sidebar-nav-item-parent {
	justify-content: space-between;
	width: 100%;
	text-align: left;
	cursor: pointer;
	font-weight: 500;
}

.sidebar-nav-item-parent .nav-text-wrap {
	display: flex;
	align-items: center;
	gap: 0.5em;
	flex-grow: 1;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.sidebar-nav-item > .iconify,
.sidebar-nav-item-parent .iconify {
	font-size: 1.5em;
}

.sidebar-nav-item > .nav-text,
.sidebar-nav-item-parent .nav-text {
	flex-grow: 1;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.sidebar-nav-item > .external-tip,
.sidebar-nav-item-parent .external-tip {
	opacity: 0.5;
	font-size: 1em;
}

.sidebar-nav-item-parent.open {
	background-color: var(--c-bg-soft);
	color: var(--c-text);
}

.sidebar-subnav {
	margin: 0.2em 0 0 1.2rem;
	padding: 0;
	list-style: none;
}

.sidebar-subnav li {
	margin: 0.25em 0;
}

.submenu-item {
	padding-left: 0.5em;
	background-color: transparent;
	font-size: 0.9em;
}

.submenu-item .iconify {
	font-size: 1.1em;
}

.search-btn {
	opacity: 0.5;
	margin: 1rem 0;
	outline: 2px solid var(--c-border);
	outline-offset: -2px;
	cursor: text;
	user-select: none;

	&:hover {
		opacity: 1;
		outline-color: transparent;
		background-color: transparent;
	}
}

.sidebar-footer {
	--gap: clamp(0.5rem, 3vh, 1rem);

	position: relative;
	display: grid;
	gap: var(--gap);
	padding: var(--gap);
	font-size: 0.8em;
	text-align: center;
	color: var(--c-text-2);

	> * {
		position: relative;
		z-index: 1;
	}
}
</style>
