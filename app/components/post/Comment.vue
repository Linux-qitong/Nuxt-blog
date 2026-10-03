<script setup lang="tsx">
import type { TippyComponent } from 'vue-tippy'

const appConfig = useAppConfig()

const commentEl = useTemplateRef('comment')
const popoverEl = useTemplateRef<TippyComponent>('popover')
const popoverJumpTo = ref('')
const popoverInputEl = useTemplateRef('popover-input')
const showUndo = ref(false)

const popoverBind = ref<TippyComponent['$props']>({})

/** 评论区链接守卫 */
useEventListener(commentEl, 'click', (e) => {
	if (!(e.target instanceof Element))
		return

	if (e.target.matches('.tk-avatar-img'))
		e.stopPropagation()

	const popoverTarget = e.target.closest('a[target="_blank"]')
	if (!(popoverTarget instanceof HTMLAnchorElement))
		return

	e.preventDefault()
	popoverEl.value?.hide()

	popoverJumpTo.value = safelyDecodeUriComponent(popoverTarget.href)
	popoverBind.value = {
		getReferenceClientRect: () => popoverTarget.getBoundingClientRect(),
		triggerTarget: popoverTarget,
	}

	nextTick(checkUndoable)
	popoverEl.value?.show()
}, { capture: true })

function checkUndoable() {
	showUndo.value = popoverInputEl.value?.textContent !== popoverJumpTo.value
}

function undo() {
	if (!popoverInputEl.value)
		return
	popoverInputEl.value.textContent = popoverJumpTo.value
	checkUndoable()
}

function confirmOpen() {
	window.open(popoverInputEl.value?.textContent, '_blank')
}

onMounted(() => {
	window.twikoo?.init?.({
		envId: appConfig.twikoo?.envId,
		// twikoo 会把挂载后的元素变为 #twikoo
		el: '#twikoo',
	})
})
</script>

<template>
<section ref="comment" class="z-comment">
	<h3 class="text-creative">
		评论区
	</h3>

	<!-- interactive 默认会把气泡移动到 triggerTarget 的父元素上 -->
	<Tooltip
		ref="popover"
		v-bind="popoverBind"
		:append-to="() => commentEl!"
		interactive
		:aria="{ expanded: false }"
		trigger="focusin"
	>
		<template #content>
			<div class="popover-confirm">
				<span
					ref="popover-input"
					class="input"
					contenteditable="plaintext-only"
					spellcheck="false"
					@input="checkUndoable"
					@keydown.enter.prevent="confirmOpen"
					v-text="popoverJumpTo"
				/>

				<button
					v-if="showUndo"
					aria-label="恢复原始内容"
					@click="undo()"
				>
					<Icon name="tabler:arrow-back-up" />
				</button>

				<ZButton
					primary
					text="访问"
					@click="confirmOpen"
				/>
			</div>
		</template>
	</Tooltip>

	<div id="twikoo">
		<div class="comment-loading">
			<div class="loading-spinner"></div>
			<p>评论加载中...</p>
		</div>
	</div>
</section>
</template>

<style scoped>
.z-comment {
	margin: 3rem 1rem;

	> h3 {
		margin-top: 3rem;
		font-size: 1.25rem;
	}
}

:deep() > [data-tippy-root] > .tippy-box {
	padding: 0;
}

.popover-confirm {
	display: flex;
	align-items: center;
	overflow-wrap: anywhere;

	> .input {
		min-width: 0;
		padding: 0.3em 0.6em;
		outline: none;
	}

	> button {
		flex-shrink: 0;
		align-self: stretch;
		padding: 0.3em;
		border-radius: 0 0.5em 0.5em 0;
	}
}

:deep(#twikoo) {
	margin: 2em 0;

	.tk-admin-container {
		position: fixed;
		z-index: calc(var(--z-index-popover) + 1);
	}

	.tk-submit {
		display: flex;
		flex-direction: column;

		.tk-avatar,
		.tk-submit-action-icon.__markdown {
			display: none;
		}

		.tk-preview-container {
			margin: 0 0 .5rem 0;
		}

		.tk-row.actions {
			justify-content: flex-end;
			margin: 0 0 .5rem;
			order: 3;
		}

		.tk-textarea {
			order: 1;
			margin-bottom: .5rem;
			font-family: var(--font-monospace);

			.tk-input__inner {
				background-color: var(--c-bg-2);
				border: 2px solid var(--c-border);
				border-radius: 12px;
				padding: .8rem;
				transition: all .2s;

				&:focus {
					background-color: var(--c-bg);
					background-position-y: 350px;
					border-color: var(--c-primary);
				}
			}
		}

		.tk-meta-input {
			order: 2;
			position: relative;

			.tk-input {
				background: var(--c-bg-2);
				border: 2px solid var(--c-border);
				border-radius: 10px;
				transition: all .2s;

				&:focus-within {
					background: var(--c-bg);
					border-color: var(--c-primary);

					&::before, &::after {
						animation: fadeInTip .3s ease;
						display: block;
					}
				}

				&::before {
					background: var(--c-bg);
					border: 1px solid var(--c-border);
					border-radius: 8px;
					color: var(--c-text-1);
					display: none;
					font-size: .9rem;
					left: 50%;
					padding: .8rem 1rem;
					position: absolute;
					top: -60px;
					transform: translate(-50%);
					white-space: nowrap;
					z-index: 100;
				}

				&::after {
					border: 8px solid transparent;
					border-top: 8px solid var(--c-bg);
					content: "";
					display: none;
					left: 50%;
					position: absolute;
					top: -12px;
					transform: translate(-50%);
				}
			}

			.tk-input:first-child::before { content: "输入QQ号会自动获取昵称和头像🐧"; }
			.tk-input:nth-child(2)::before { content: "收到回复将会发送到您的邮箱📧"; }
			.tk-input:nth-child(3)::before { content: "可以通过昵称访问您的网站🔗"; }

			.tk-input__inner {
				border: none !important;
			}

			.tk-input-group__prepend {
				background: var(--c-bg-1);
				border: none;
				border-radius: 8px 0 0 8px;
				color: var(--c-text-2);
				transition: all .2s;
			}
		}
	}

	.OwO .OwO-body {
		animation: fadeInPanel .3s ease .1s 1 normal both;
		background: var(--c-bg);
		border-radius: 8px;
		transform: translateZ(0);
	}

	.tk-avatar {
		border-radius: 50%;
		overflow: hidden;

		@supports (corner-shape: squircle) {
			corner-shape: superellipse(1.2);
		}
	}

	.tk-avatar.tk-clickable {
		cursor: auto;
	}

	.tk-time {
		color: var(--c-text-3);
	}

	/* 防止 a 被 overflow hidden */
	.tk-content {
		margin: -0.2em;
		padding: 0.2em;
		font-size: .95rem;
		line-height: 1.6;

		.tk-owo-emotion {
			width: auto;
			height: 1.4em;
			vertical-align: text-bottom;
		}

		p > code, > code {
			background: var(--c-bg-2);
			border: 1px solid var(--c-border);
			border-radius: 6px;
			padding: .2em .4em;
		}

		.code-toolbar, > span > pre {
			background: var(--c-bg-2);
			border: 2px solid var(--c-border);
			border-radius: 8px;
			overflow: auto;
			padding: .4rem;
			position: relative;

			&::before {
				display: none;
			}

			pre {
				margin-top: .75rem;

				code {
					display: block;
					padding-top: .75rem;
				}
			}
		}
	}

	.tk-comments-title, .tk-nick {
		font-family: var(--font-creative);
		margin-bottom: 0;
	}

	.tk-nick-link {
		color: var(--c-primary);
	}

	.tk-extras, .tk-footer {
		font-size: 0.7em;
		color: var(--c-text-3);
	}

	/* 屏蔽点赞和踩赞按钮，保留回复按钮*/
	.tk-action .tk-action-link:not(:last-child) {
		display: none !important;
	}

	.tk-comment .tk-main {
		.tk-meta {
			margin-bottom: .3rem;
		}

		.tk-extras {
			color: var(--c-text-2);
			font-size: .85rem;
			margin-top: .5rem;
		}
	}

	.tk-replies:not(.tk-replies-expand) {
		mask-image: linear-gradient(to top, transparent, #FFF 4em);
	}

	.tk-expand {
		border-radius: 0.5em;
		background-color: var(--c-bg-2);
		color: var(--c-text-1);
		padding: 0.375rem 1rem;
		transition: background-color 0.1s;

		&:hover {
			background-color: var(--c-bg-3);
		}
	}

	.tk-button:not(.tk-button--primary) {
		border-radius: 8px;
		background-color: var(--c-bg-2);
		color: var(--c-text-1);
		border: 1px solid var(--c-border);

		&:hover {
			background-color: var(--c-bg-3);
			border-color: var(--c-primary);
		}
	}

	.tk-button--primary {
		border-radius: 8px;
		background-color: var(--c-primary);
		color: white;
		border: 1px solid var(--c-primary);

		&:hover {
			background-color: var(--c-primary-soft);
			border-color: var(--c-primary-soft);
		}
	}

	.tippy-svg-arrow > svg {
		fill: inherit;
		width: auto;
		height: auto;
	}
}

:deep(:where(.tk-preview-container,.tk-content)) {
	pre {
		overflow: auto;
		border-radius: 0.5em;
		font-size: 0.85em;
	}

	a {
		margin: -0.1em -0.2em;
		padding: 0.1em 0.2em;
		background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat center bottom / 100% 0.1em;
		color: var(--c-primary);
		transition: all 0.2s;

		&:hover {
			border-radius: 0.3em;
			background-size: 100% 100%;
		}
	}

	p {
		margin: 0.2em 0;
	}

	img {
		border-radius: 0.5em;
	}

	menu, ol, ul {
		margin: 0.5em 0;
		padding-inline-start: 1.5em;
		font-size: 0.9rem;
		list-style: revert;

		> li {
			margin: 0.2em 0;

			&::marker {
				color: var(--c-primary);
			}
		}
	}

	blockquote {
		margin: 0.5rem 0 0.8rem;
		padding: 0.2em 0.8rem;
		border-inline-start: 4px solid var(--c-border);
		border-radius: 8px;
		background-color: var(--c-bg-2);
		font-size: 0.9em;
	}
}

.comment-loading {
	color: var(--c-text-2);
	padding: 2rem;
	text-align: center;

	.loading-spinner {
		animation: spin 1s linear infinite;
		border: 3px solid var(--c-bg-3);
		border-top-color: var(--c-primary);
		border-radius: 50%;
		height: 40px;
		margin: 0 auto 1rem;
		width: 40px;
	}

	p {
		font-size: .9rem;
	}
}

@keyframes spin {
	0% { transform: rotate(0); }
	to { transform: rotate(1turn); }
}

@keyframes fadeInTip {
	from { opacity: 0; transform: translate(-50%, 10px); }
	to { opacity: 1; transform: translate(-50%); }
}

@keyframes fadeInPanel {
	from { opacity: 0; transform: translateY(-20px); }
	to { opacity: 1; transform: translateY(0); }
}
</style>
