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
  <h3 class="text-creative">评论区</h3>
  <div id="twikoo">
    <div class="comment-loading">
      <div class="loading-spinner"></div>
      <p>评论加载中...</p>
    </div>
  </div>
</section>
</template>

<style lang="scss" scoped>
.z-comment {
  margin: 2rem auto;
  padding: 0 1rem;
  
  h3 {
    margin-top: 3rem;
    font-size: 1.25rem;
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
  
  p { font-size: .9rem; }
}

:deep(#twikoo > :not(.tk-admin-container)) {
  .tk-avatar {
    border-radius: 50% !important;
    overflow: hidden;
  }
  
  .tk-submit {
    display: flex;
    flex-direction: column;
    
    .tk-avatar,
    a.tk-submit-action-icon.__markdown { display: none; }
    
    .tk-preview-container { margin-bottom: .5rem; margin-left: 0; }
    
    .tk-row.actions {
      justify-content: flex-end;
      margin: 0 0 .5rem;
      order: 3;
    }
    
    .tk-input {
      margin-bottom: .5rem;
      order: 1;
      
      .el-textarea__inner {
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
      
      .el-input-group {
        background: var(--c-bg-2);
        border: 2px solid var(--c-border);
        border-radius: 10px;
        transition: all .2s;
        
        &:focus-within {
          background: var(--c-bg);
          border-color: var(--c-primary);
          
          &:before,
          &:after { animation: fadeInTip .3s ease; display: block; }
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
      }
      
      .el-input-group:first-child:before { content: "输入QQ号会自动获取昵称和头像🐧"; }
      .el-input-group:nth-child(2):before { content: "收到回复将会发送到您的邮箱📧"; }
      .el-input-group:nth-child(3):before { content: "可以通过昵称访问您的网站🔗"; }
      
      .el-input__inner { border: none !important; }
      
      .el-input-group__prepend {
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
  
  .tk-content {
    font-size: .95rem;
    line-height: 1.6;
    
    .tk-owo-emotion { height: 1.4em; vertical-align: text-bottom; width: auto; }
    
    a {
      background: linear-gradient(var(--c-primary-soft), var(--c-primary-soft)) no-repeat bottom/100% .1em;
      color: var(--c-primary);
      margin: 0 -.1em;
      padding: 0 .1em;
      transition: all .2s;
      
      &:hover { background-size: 100% 100%; border-radius: .3em; }
    }
    
    p > code,
    > code {
      background: var(--c-bg-2);
      border: 1px solid var(--c-border);
      border-radius: 6px;
      padding: .2em .4em;
    }
    
    .code-toolbar,
    > span > pre {
      background: var(--c-bg-2);
      border: 2px solid var(--c-border);
      border-radius: 8px;
      overflow: auto;
      padding: .4rem;
      position: relative;
      
      &:before { display: none; }
      
      pre {
        margin-top: .75rem;
        
        code { display: block; padding-top: .75rem; }
      }
    }
    
    blockquote {
      background: var(--c-bg-2);
      border-left: 4px solid var(--c-border);
      border-radius: 8px;
      color: var(--c-text-2);
      margin-bottom: .8rem;
      padding: .8rem;
      transition: all .2s;
    }
  }
  
  .tk-comments-title { margin-bottom: 0; }
  
  .tk-replies:not(.tk-replies-expand) {
    -webkit-mask: linear-gradient(#fff 50%, transparent);
    mask: linear-gradient(#fff 50%, transparent);
  }
  
  .tk-expand {
    border-radius: .5rem;
    background-color: var(--c-bg-2);
    color: var(--c-text-1);
    padding: 0.375rem 1rem;
    transition: background-color 0.1s;
    
    &:hover { background-color: var(--c-bg-3); }
  }
  
  .tk-nick-link { color: var(--c-primary); }
  
  .tk-comment .tk-main {
    .tk-meta { margin-bottom: .3rem; }
    
    .tk-extras {
      color: var(--c-text-2);
      font-size: .85rem;
      margin-top: .5rem;
    }
    
    .tk-action .tk-action-link:first-child { display: none; }
  }
  
  .tk-preview,
  .tk-cancel {
    border-radius: 8px;
    background-color: var(--c-bg-2);
    color: var(--c-text-1);
    border: 1px solid var(--c-border);
    
    &:hover {
      background-color: var(--c-bg-3);
      border-color: var(--c-primary);
    }
  }
  
  .tk-send {
    border-radius: 8px;
    background-color: var(--c-primary);
    color: white;
    border: 1px solid var(--c-primary);
    
    &:hover {
      background-color: var(--c-primary-soft);
      border-color: var(--c-primary-soft);
    }
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
