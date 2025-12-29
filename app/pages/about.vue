<script setup lang="ts">
const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'blog-log', 'comm-group'])

const { author } = useAppConfig()
const title = '关于我'
const description = '博主的个人介绍页面。'
useSeoMeta({ title, description, ogImage: author.avatar })

// 初始化统计数据
const statsData = ref({
  today_uv: '加载中...',
  today_pv: '加载中...',
  yesterday_uv: '加载中...',
  yesterday_pv: '加载中...',
  last_month_pv: '加载中...',
  last_year_pv: '加载中...'
})

// 获取Umami统计数据
onMounted(async () => {
  try {
    const response = await $fetch<any>('https://umami.linux-qitong.top/api/stats', {
      method: 'GET',
      headers: {
        // 如果需要认证，请添加相应的headers
        // 'Authorization': 'Bearer your-token-here'
      }
    })

    if (response) {
      statsData.value = {
        today_uv: formatNumber(response.today_uv || 0),
        today_pv: formatNumber(response.today_pv || 0),
        yesterday_uv: formatNumber(response.yesterday_uv || 0),
        yesterday_pv: formatNumber(response.yesterday_pv || 0),
        last_month_pv: formatNumber(response.last_month_pv || 0),
        last_year_pv: formatNumber(response.last_year_pv || 0)
      }
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
})

// 格式化数字
function formatNumber(num: number) {
  if (num >= 10000) {
    return `${(num / 10000).toFixed(1)}万`
  }
  return num.toString()
}
</script>

<template>
<div class="about-page">
  <div class="about-content">
    <!-- 页面标题 -->
    <header class="about-header">
      <div class="header-avatar">
        <div class="avatar-frame">
          <img :src="author.avatar" alt="作者头像" class="avatar-image">
        </div>
      </div>
      <div class="header-text">
        <h1>关于我</h1>
        <p>总有些事情比永恒更重要！</p>
      </div>
    </header>

    <!-- 卡片网格布局 -->
    <div class="cards-grid">
      <!-- 个人介绍卡片 -->
      <div class="card intro-card">
        <p>您好，很高兴认识您！👋</p>
        <h2>我叫 {{ author.name }}</h2>
        <p>是一名 学生、独立开发者、灵墨社区管理员、志海融新成员、博主。</p>
        <Icon name="ph:user-circle-bold" class="card-bg-icon" />
      </div>

      <!-- 信息卡片 - 出生和年龄 -->
      <div class="card info-card age-card">
        <div class="info-item special-info-item">
          <span class="label">出生</span>
          <span class="value">2009</span>
        </div>
        <div class="info-item special-info-item">
          <span class="label">当前</span>
          <span class="value">16岁 <Icon name="ph:graduation-cap-bold" /></span>
        </div>
        <Icon name="ph:calendar-dots-bold" class="card-bg-icon" />
      </div>

      <!-- 座右铭卡片 -->
      <div class="card motto-card">
        <span class="label">座右铭</span>
        <p>越努力</p>
        <p>越幸运</p>
        <Icon name="ph:compass-bold" class="card-bg-icon" />
      </div>

      <!-- 关注偏好卡片 -->
      <div class="card tech-card">
        <span class="label">关注偏好</span>
        <h3>资源分享</h3>
        <p>小说、PC游戏</p>
        <Icon name="ph:star-bold" class="card-bg-icon" />
      </div>

      <!-- 音乐偏好卡片 -->
      <div class="card music-card">
        <span class="label">音乐偏好</span>
        <h3>情歌、民谣、轻音乐</h3>
        <p>等我喜欢就听</p>
        <Icon name="ph:music-notes-simple-bold" class="card-bg-icon" />
      </div>

      <!-- 性格卡片 -->
      <div class="card info-card personality-card">
        <span class="label">性格</span>
        <div class="content-center">
          <span class="value">指挥官</span>
          <span class="value-small">ENTJ-T</span>
        </div>
        <ProseA class="card-link" href="https://www.16personalities.com">在 16 Personalities 了解更多</ProseA>
        <Icon name="ph:brain-bold" class="card-bg-icon" />
      </div>

      <!-- 特长卡片 -->
      <div class="card specialty-card">
        <span class="label">特长</span>
        <p class="specialty-text">
          Linux、社区管理专家
        </p>
        <p class="specialty-text">
          学习能力 <span class="highlight">MAX</span>
        </p>
        <Icon name="ph:magic-wand-bold" class="card-bg-icon" />
      </div>

      <!-- 联系方式卡片 -->
      <div class="card contact-card">
        <span class="label">联系我</span>
        <div class="contact-links">
          <ZButton class="contact-link" v-tip="'邮箱'" icon="ph:envelope-simple-bold" :to="`mailto:${author.email}`" />
          <ZButton class="contact-link" v-tip="'微信'" icon="ph:wechat-logo-bold" to="https://weixin.qq.com" />
          <ZButton class="contact-link" v-tip="'哔哩哔哩'" icon="ri:bilibili-fill" to="https://bilibili.com" />
          <ZButton class="contact-link" v-tip="'Telegram'" icon="ph:telegram-logo-bold" to="https://t.me" />
          <ZButton class="contact-link" v-tip="'Discord'" icon="ph:discord-logo-bold" to="https://discord.com" />
          <ZButton class="contact-link" v-tip="'X'" icon="ph:x-logo-bold" to="https://x.com" />
        </div>
        <Icon name="ph:address-book-bold" class="card-bg-icon" />
      </div>

      <!-- 网站统计卡片 -->
      <div class="card stats-card">
        <span class="label">网站统计</span>
        <div class="stats-content">
          <div class="stats-range-section">
            <div class="stats-grid">
              <div class="stat-item">
                <span class="stat-value">{{ statsData.today_pv }}</span>
                <span class="stat-label">浏览量</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ statsData.today_uv }}</span>
                <span class="stat-label">访客数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ statsData.yesterday_pv }}</span>
                <span class="stat-label">访问次数</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ statsData.yesterday_uv }}</span>
                <span class="stat-label">分钟停留</span>
              </div>
            </div>
          </div>
        </div>
        <Icon name="ph:chart-line-bold" class="card-bg-icon" />
      </div>
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
// 全局样式
.about-page {
  padding: 2rem 1rem;
  min-height: calc(100vh - var(--header-height));
  animation: float-in .3s backwards;
}

.about-content {
  max-width: 1000px;
  margin: 0 auto;
}

// 页面标题
.about-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
  padding: 1rem 0;
  text-align: center;

  .header-text {
    h1 {
      margin-bottom: .5rem;
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--c-text-1);
    }

    p {
      margin: 0;
      font-size: 1.2rem;
      color: var(--c-text-2);
    }
  }

  .header-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.5rem; 
  }

  .avatar-frame {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    width: 120px;
    height: 120px;
    border: 3px solid var(--c-border);
    border-radius: 50%;
    background-color: var(--c-bg-soft);
    transition: all .3s ease;
    
    @supports (corner-shape: squircle) {
      corner-shape: superellipse(1.2);
    }
  }

  .avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 卡片网格布局
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

// 通用卡片样式
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  min-height: 220px;
  padding: 2rem 1.5rem;
  border: 1px solid var(--c-border);
  border-radius: 1.5rem;
  background-color: var(--ld-bg-card);
  text-align: center;
  transition: all .3s ease;
  box-shadow: none;

  &:hover {
    box-shadow: none;
    transform: none;
  }

  .label {
    position: absolute;
    opacity: .8;
    top: 1rem;
    left: 1.5rem;
    margin: 0;
    font-size: .8rem;
    color: var(--c-text-2);
  }

  .card-bg-icon {
    position: absolute;
    opacity: .1;
    right: 1rem;
    bottom: 1rem;
    font-size: 5rem;
    color: var(--c-text-1);
    pointer-events: none;
  }
}

// 卡片类型样式

// 个人介绍卡片
.intro-card {
  grid-column: 1 / -1;
  color: var(--c-text-1);

  h2 {
    margin: .5rem 0;
    font-size: 3rem;
    font-weight: bold;
  }
}

// 信息卡片基类
.info-card {
  align-items: stretch;
  justify-content: center;
  padding: 2.5rem 1.5rem;
  color: var(--c-text-1);

  .info-item {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    align-items: flex-start;
    justify-content: center;
    position: relative;
    width: 100%;

    .label {
      flex-shrink: 0;
      position: static;
      width: 100%;
      margin-bottom: .5rem;
      text-align: left;
    }
  }

  .value {
    display: block;
    width: 100%;
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
  }

  .value-small {
    display: block;
    width: 100%;
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
  }

  .card-link {
    position: absolute;
    right: 1.5rem;
    bottom: 1rem;
    font-size: .8rem;
    color: var(--c-text-2);

    &:hover {
      color: var(--c-primary);
    }
  }
}

// 年龄卡片
.age-card {
  padding: .4rem 1.5rem .5rem;
}

// 座右铭卡片
.motto-card {
  color: var(--c-text-1);

  p {
    margin: 0;
    font-size: 2.5rem;
    font-weight: bold;
    line-height: 1.2;
  }
}

// 关注偏好卡片
.tech-card {
  color: var(--c-text-1);

  h3 {
    margin: .5rem 0;
    font-size: 3rem;
    font-weight: bold;
  }

  p {
    color: var(--c-text-2);
  }
}

// 音乐偏好卡片
.music-card {
  color: var(--c-text-1);

  h3 {
    font-size: 2.5rem;
    font-weight: bold;
  }

  p {
    color: var(--c-text-2);
  }
}

// 特长卡片
.specialty-card {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  color: var(--c-text-1);

  .specialty-text {
    margin: .2em 0;
  }

  .highlight {
    display: inline-block;
    font-size: 2.5rem;
    line-height: 1;
    color: var(--c-primary);
  }
}

// 联系方式卡片
.contact-card {
  grid-column: 1 / -1;
  color: var(--c-text-1);

  .contact-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    max-width: 600px;
    margin: 0 auto;
  }

  .contact-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 50px;
    height: 50px;
    background-color: var(--c-bg-1);
    border: 1px solid var(--c-border);
    border-radius: 50%;
    color: var(--c-text-1);
    font-size: 1.4rem;
    transition: all .2s ease;
    padding: 0;
    box-shadow: none;

    &:hover {
      background-color: var(--c-bg-soft);
      color: var(--c-text);
    }
  }
}

// 网站统计卡片
.stats-card {
  grid-column: 1 / -1;
  color: var(--c-text-1);
}

.stats-content {
  width: 100%;
}

.stats-range-section {
  margin-bottom: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: .5rem;
  background-color: var(--c-bg-1);
  border-radius: .8rem;
  transition: transform .2s ease;
}

.stat-value {
  margin-bottom: .25rem;
  font-size: 2rem;
  font-weight: bold;
  color: var(--c-text-1);
}

.stat-label {
  opacity: .9;
  font-size: .9rem;
  color: var(--c-text-2);
}

// 动画效果
@keyframes float-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式布局
@media (max-width: 768px) {
  .about-page {
    padding: 1rem;
  }
  
  .about-header {
    flex-direction: column;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .about-header .header-text {
    margin-bottom: 1.5rem;
  }
  
  .avatar-frame {
    width: 100px;
    height: 100px;
  }
  
  .card {
    padding: 1.5rem 1rem;
  }
  
  .cards-grid {
    gap: 1rem;
  }

  .age-card {
    padding: .4rem 1.5rem .5rem;
  }

  .contact-card .contact-link {
    width: 45px;
    height: 45px;
    font-size: 1.2rem;
  }

  .stats-card {
    padding: 3rem 1rem 1.5rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

// 暗黑模式支持
:deep(.dark-mode) {
  .card {
    border-color: var(--c-border);
    background-color: var(--c-bg-2);
  }

  .label, .card-bg-icon, .tech-card p, .stat-label {
    color: var(--c-text-2);
  }

  .info-card .card-link {
    color: var(--c-text-2);

    &:hover {
      color: var(--c-primary);
    }
  }

  .specialty-card .highlight {
    color: var(--c-primary);
  }

  .contact-card .contact-link {
    background-color: var(--c-bg-1);
    border-color: var(--c-border);
    color: var(--c-text-1);

    &:hover {
      background-color: var(--c-bg-soft);
      color: var(--c-text);
      transform: translateY(-2px);
      border-color: var(--c-border);
    }
  }

  .stat-item {
    background-color: var(--c-bg-1);
  }

  .avatar-frame {
    border-color: var(--c-border);
    background-color: var(--c-bg-soft);
  }
}
</style>

<style lang="scss">
.dark .tippy-box {
  background-color: var(--c-bg-2);

  .tippy-svg-arrow {
    fill: var(--c-bg-2);
  }
}
</style>
