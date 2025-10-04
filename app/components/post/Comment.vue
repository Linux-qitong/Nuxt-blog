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

  .comment-header {
    align-items: center;
    display: flex;
    justify-content: space-between;

    h3 {
      font-size: 1.5rem;
      margin: 0;
    }

    .privacy-btn {
      border-radius: 4px;
      color: var(--c-text-2);
      padding: 4px;
      transition: all .2s;

      &:hover {
        background-color: var(--c-bg-soft);
        color: var(--c-text-1);
      }
    }
  }

  .comment-container {
    min-height: 200px;
  }

  .comment-loading {
    color: var(--c-text-2);
    padding: 2rem;
    text-align: center;

    .loading-spinner {
      animation: spin 1s linear infinite;
      border-top: 3px solid var(--c-bg-3);
      border: 3px solid var(--c-bg-3);
      border-radius: 50%;
      border-top-color: var(--c-primary);
      height: 40px;
      margin: 0 auto 1rem;
      width: 40px;
    }

    p {
      font-size: .9rem;
    }
  }

  :deep(#twikoo > :not(.tk-admin-container)) {
    .tk-submit {
      display: flex;
      flex-direction: column;

      .tk-avatar,
      a.tk-submit-action-icon.__markdown {
        display: none;
      }

      .tk-preview-container {
        margin-bottom: .5rem;
        margin-left: 0;
      }

      .tk-row.actions {
        justify-content: flex-end;
        margin: 0 0 .5rem;
        order: 3;
      }

      .tk-input {
        margin-bottom: .5rem;
        order: 1;

        .el-textarea__inner {
          background: var(--c-bg-2);
          background-position: 100% 100%;
          background-repeat: no-repeat;
          background-size: contain;
          border: 2px solid var(--c-border);
          border-radius: 12px;
          padding: .8rem;
          transition: all .2s;

          &:focus {
            background: var(--c-bg);
            background-position: 100% 100%;
            background-position-y: 350px;
            background-repeat: no-repeat;
            background-size: contain;
            border-color: #409eff;
          }
        }
      }

      .tk-meta-input {
        order: 2;
        position: relative;

        .el-input-group {
          background: var(--c-bg-2);
          border: 2px solid var(--c-border);
          border-radius: 10px;
          transition: all .2s;

          &:focus-within {
            background: var(--c-bg);
            border-color: #409eff;
          }

          /* 提示文本 */
          &:first-child:before {
            content: "输入QQ号会自动获取昵称和头像🐧";
          }

          &:nth-child(2):before {
            content: "收到回复将会发送到您的邮箱📧";
          }

          &:nth-child(3):before {
            content: "可以通过昵称访问您的网站🔗";
          }

          &:before {
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

          &:after {
            border: 8px solid transparent;
            border-top: 8px solid var(--c-bg);
            content: "";
            display: none;
            left: 50%;
            position: absolute;
            top: -12px;
            transform: translate(-50%);
          }

          &:focus-within:after,
          &:focus-within:before {
            animation: fadeInTip .3s ease;
            display: block;
          }

          .el-input__inner {
            border: none !important;
          }

          .el-input-group__prepend {
            background: var(--c-bg-1);
            border: none;
            border-radius: 8px 0 0 8px;
            color: var(--c-text-2);
            transition: all .2s;
          }
        }
      }
    }

    /* 表情选择器 */
    .OwO {
      .OwO-body {
        animation: fadeInPanel .3s ease .1s 1 normal both;
        background: var(--c-bg);
        border-radius: 8px;
        transform: translateZ(0);
      }
    }

    /* 内容样式 */
    .tk-content {
      .tk-owo-emotion {
        height: 1.4em;
        vertical-align: text-bottom;
        width: auto;
      }

      a {
        background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat bottom/100% .1em;
        color: #409eff;
        margin: 0 -.1em;
        padding: 0 .1em;
        transition: all .2s;

        &:hover {
          background-size: 100% 100%;
          border-radius: .3em;
        }
      }

      p > code {
        background-color: var(--c-bg-2);
        border-radius: 4px;
        color: var(--c-text-1);
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        padding: 0.1em 0.3em;
      }
    }
  }
}

/* 旋转动画 */
@keyframes spin {
  0% {
    transform: rotate(0);
  }
  to {
    transform: rotate(1turn);
  }
}

/* 淡入动画 */
@keyframes fadeInTip {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

@keyframes fadeInPanel {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
