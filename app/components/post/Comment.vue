<script setup lang="ts">
const appConfig = useAppConfig()

onMounted(() => {
  window.twikoo?.init({
    envId: appConfig.twikoo?.envId,
    // twikoo 会把挂载后的元素变为 #twikoo
    el: '#twikoo',
  })
})
</script>

<template>
<section class="z-comment">
  <h3 class="text-creative">
    评论区
  </h3>
  <div id="twikoo">
    <p>评论加载中...</p>
  </div>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
  margin: 2rem auto;
  padding: 0 1rem;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-header h3 {
  font-size: 1.5rem;
  margin: 0;
}

.privacy-btn {
  border-radius: 4px;
  color: var(--c-text-2);
  padding: 4px;
  transition: all .2s;
}

.privacy-btn:hover {
  background-color: var(--c-bg-soft);
  color: var(--c-text-1);
}

.comment-container {
  min-height: 200px;
}

.comment-loading {
  color: var(--c-text-2);
  padding: 2rem;
  text-align: center;
}

.loading-spinner {
  animation: spin 1s linear infinite;
  border: 3px solid var(--c-bg-3);
  border-radius: 50%;
  border-top-color: var(--c-primary);
  height: 40px;
  margin: 0 auto 1rem;
  width: 40px;
}

.comment-loading p {
  font-size: .9rem;
}

:deep(#twikoo > :not(.tk-admin-container)) {
  .tk-submit {
    display: flex;
    flex-direction: column;
  }

  .tk-submit .tk-avatar,
  .tk-submit a.tk-submit-action-icon.__markdown {
    display: none;
  }

  .tk-submit .tk-preview-container {
    margin-bottom: .5rem;
    margin-left: 0;
  }

  .tk-submit .tk-row.actions {
    justify-content: flex-end;
    margin: 0 0 .5rem;
    order: 3;
  }

  .tk-submit .tk-input {
    margin-bottom: .5rem;
    order: 1;
  }

  .tk-submit .tk-input .el-textarea__inner {
    background: var(--c-bg-2);
    background-position: 100% 100%;
    background-repeat: no-repeat;
    background-size: contain;
    border: 2px solid var(--c-border);
    border-radius: 12px;
    padding: .8rem;
    transition: all .2s;
  }

  .tk-submit .tk-input .el-textarea__inner:focus {
    background: var(--c-bg);
    background-position: 100% 350px;
    background-repeat: no-repeat;
    background-size: contain;
    border-color: #409eff;
  }

  .tk-submit .tk-meta-input {
    order: 2;
    position: relative;
  }

  .tk-submit .tk-meta-input .el-input-group {
    background: var(--c-bg-2);
    border: 2px solid var(--c-border);
    border-radius: 10px;
    transition: all .2s;
  }

  .tk-submit .tk-meta-input .el-input-group:focus-within {
    background: var(--c-bg);
    border-color: #409eff;
  }

  .tk-submit .tk-meta-input .el-input-group:first-child:before {
    content: "输入QQ号会自动获取昵称和头像🐧";
  }

  .tk-submit .tk-meta-input .el-input-group:nth-child(2):before {
    content: "收到回复将会发送到您的邮箱📧";
  }

  .tk-submit .tk-meta-input .el-input-group:nth-child(3):before {
    content: "可以通过昵称访问您的网站🔗";
  }

  .tk-submit .tk-meta-input .el-input-group:before {
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

  .tk-submit .tk-meta-input .el-input-group:after {
    border: 8px solid transparent;
    border-top: 8px solid var(--c-bg);
    content: "";
    display: none;
    left: 50%;
    position: absolute;
    top: -12px;
    transform: translate(-50%);
  }

  .tk-submit .tk-meta-input .el-input-group:focus-within:after,
  .tk-submit .tk-meta-input .el-input-group:focus-within:before {
    animation: fadeInTip .3s ease;
    display: block;
  }

  .tk-submit .tk-meta-input .el-input__inner {
    border: none !important;
  }

  .tk-submit .tk-meta-input .el-input-group__prepend {
    background: var(--c-bg-1);
    border: none;
    border-radius: 8px 0 0 8px;
    color: var(--c-text-2);
    transition: all .2s;
  }

  .OwO .OwO-body {
    animation: fadeInPanel .3s ease .1s 1 normal both;
    background: var(--c-bg);
    border-radius: 8px;
    transform: translateZ(0);
  }

  .tk-content {
    font-size: .95rem;
    line-height: 1.6;
  }

  .tk-content .tk-owo-emotion {
    height: 1.4em;
    vertical-align: text-bottom;
    width: auto;
  }

  .tk-content a {
    background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat bottom/100% .1em;
    color: #409eff;
    margin: 0 -.1em;
    padding: 0 .1em;
    transition: all .2s;
  }

  .tk-content a:hover {
    background-size: 100% 100%;
    border-radius: .3em;
  }

  .tk-content p > code,
  .tk-content > code {
    background: var(--c-bg-2);
    border: 1px solid var(--c-border);
    border-radius: 6px;
    padding: .2em .4em;
  }

  .tk-content .code-toolbar,
  .tk-content > span > pre {
    background: var(--c-bg-2);
    border: 2px solid var(--c-border);
    border-radius: 8px;
    overflow: auto;
    padding: .4rem;
    position: relative;
  }

  .tk-content .code-toolbar:before,
  .tk-content > span > pre:before {
    background: #ff5f56;
    border-radius: 50%;
    box-shadow: 1.2rem 0 #ffbd2e, 2.4rem 0 #27c93f;
    content: "";
    height: .75rem;
    left: .4rem;
    position: absolute;
    top: .4rem;
    width: .75rem;
  }

  .tk-content .code-toolbar pre,
  .tk-content > span > pre pre {
    margin-top: .75rem;
  }

  .tk-content .code-toolbar pre code,
  .tk-content > span > pre pre code {
    display: block;
    padding-top: .75rem;
  }

  .tk-content blockquote {
    background: var(--c-bg-2);
    border-left: 4px solid var(--c-border);
    border-radius: 8px;
    color: var(--c-text-2);
    margin-bottom: .8rem;
    padding: .8rem;
    position: relative;
    transition: all .2s;
  }

  // 评论标题
  .tk-comments-title {
    margin-bottom: 0;
  }

  .tk-replies:not(.tk-replies-expand) {
    -webkit-mask: linear-gradient(#fff 50%, transparent);
    mask: linear-gradient(#fff 50%, transparent);
  }

  .tk-expand {
    border-radius: .5rem;
    transition: background-color .1s;
  }

  .tk-nick-link {
    color: #409eff;
  }

  .tk-comment .tk-main .tk-meta {
    margin-bottom: .3rem;
  }

  .tk-comment .tk-main .tk-extras {
    color: var(--c-text-2);
    font-size: .85rem;
    margin-top: .5rem;
  }

  .tk-comment .tk-main .tk-action .tk-action-link:first-child {
    display: none;
  }
}

@keyframes spin {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
}

@keyframes fadeInTip {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%);
  }
}

@keyframes fadeInPanel {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
