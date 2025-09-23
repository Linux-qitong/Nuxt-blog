<script setup lang="ts">
const appConfig = useAppConfig()
useSeoMeta({
  title: '关于我',
  description: '关于博主的个人介绍页面',
  ogImage: appConfig.author.avatar
})

const layoutStore = useLayoutStore()
layoutStore.setAside(['blog-stats', 'blog-tech', 'comm-group'])

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
    // 适配https://umami.linux-qitong.top/的API格式
    const response = await $fetch('https://umami.linux-qitong.top/api/stats', {
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
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}
</script>

<template>
<div class="about-page">
  <!-- 移动端导航 -->
  <div class="mobile-only">
    <ZhiluHeader to="/" />
  </div>

  <div class="about-content">
    <!-- 页面标题 -->
    <div class="about-header">
      <h1 class="about-title">关于我</h1>
      <p class="about-subtitle">总有些事情比永恒更重要！</p>
    </div>

    <!-- 个人介绍卡片 -->
    <div class="about-profile-card">
      <h2 class="about-profile-greeting">您好, 很高兴认识您👋</h2>
      <p class="about-profile-name">我叫 青稚</p>
      <p class="about-profile-info">是一名 学生、独立开发者、灵墨社区管理员、志海融新成员、博主</p>
      <div class="about-rocket-icon">
        <Icon name="ph:rocket-bold" />
      </div>
    </div>

    <!-- 标签网格 -->
    <div class="about-tags-grid">
      <div class="about-tag-card">
        <div class="about-tag-title">出生</div>
        <div class="about-tag-value">2009</div>
        <div class="about-tag-subtitle">当前</div>
        <div class="about-tag-subvalue">16 岁 <Icon name="ph:graduation-cap-bold" /></div>
      </div>
      
      <div class="about-tag-card">
        <div class="about-tag-title">座右铭</div>
        <div class="about-tag-value">The harder you work</div>
        <div class="about-tag-subvalue">the luckier you get</div>
      </div>
      
      <div class="about-tag-card">
        <div class="about-tag-title">关注偏好</div>
        <div class="about-tag-value">资源分享</div>
        <div class="about-tag-subvalue">小说、PC游戏</div>
        <div class="about-tag-icon">
          <Icon name="ph:computer-bold" />
        </div>
      </div>
      
      <div class="about-tag-card">
        <div class="about-tag-title">音乐偏好</div>
        <div class="about-tag-value">情歌、民谣、轻音乐</div>
        <div class="about-tag-subvalue">等我喜欢就听</div>
        <div class="about-tag-icon">
          <Icon name="ph:music-notes-bold" />
        </div>
      </div>
      
      <div class="about-tag-card">
        <div class="about-tag-title">性格</div>
        <div class="about-tag-value">指挥官</div>
        <div class="about-tag-subvalue">ENTJ-T</div>
        <div class="about-tag-link">
          <ZRawLink to="https://www.16personalities.com/" target="_blank" class="about-link-text">在 16personalities 了解更多</ZRawLink>
        </div>
      </div>
      
      <div class="about-tag-card">
        <div class="about-tag-title">特长</div>
        <div class="about-tag-value">Linux、社区管理专家</div>
        <div class="about-tag-subvalue text-creative">学习能力 MAX <Icon name="ph:gamepad-bold" /></div>
      </div>
    </div>

    <!-- 联系方式 -->
    <div class="about-contact-section">
      <h2 class="about-section-title">联系方式</h2>
      <div class="about-contact-icons">
        <ZRawLink to="#" class="about-contact-icon">
          <Icon name="ph:cat-bold" />
        </ZRawLink>
        <ZRawLink to="mailto:example@email.com" class="about-contact-icon">
          <Icon name="ph:envelope-simple-bold" />
        </ZRawLink>
        <ZRawLink to="https://t.me/example" class="about-contact-icon">
          <Icon name="ph:paper-plane-bold" />
        </ZRawLink>
        <ZRawLink to="https://twitter.com/example" class="about-contact-icon">
          <Icon name="ph:twitter-logo-bold" />
        </ZRawLink>
        <ZRawLink to="https://discord.com" class="about-contact-icon">
          <Icon name="ph:discord-logo-bold" />
        </ZRawLink>
        <ZRawLink to="https://bilibili.com" class="about-contact-icon">
          <Icon name="ph:play-circle-bold" />
        </ZRawLink>
        <ZRawLink to="/about" class="about-contact-icon">
          <Icon name="ph:user-bold" />
        </ZRawLink>
      </div>
    </div>

    <!-- 网站统计 -->
    <div class="about-stats-section">
      <h2 class="about-section-title">网站统计</h2>
      <div class="about-stats-card">
        <h3 class="about-stats-title">总览统计</h3>
        <div class="about-stats-grid">
          <div class="about-stat-item">
            <div class="about-stat-value">{{ statsData.today_pv }}</div>
            <div class="about-stat-label">浏览量</div>
          </div>
          <div class="about-stat-item">
            <div class="about-stat-value">{{ statsData.today_uv }}</div>
            <div class="about-stat-label">访客数</div>
          </div>
          <div class="about-stat-item">
            <div class="about-stat-value">{{ statsData.yesterday_pv }}</div>
            <div class="about-stat-label">访问次数</div>
          </div>
          <div class="about-stat-item">
            <div class="about-stat-value">{{ statsData.yesterday_uv }}</div>
            <div class="about-stat-label">分钟停留</div>
            <div class="about-stat-chart">
              <Icon name="ph:trending-up-bold" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<style lang="scss" scoped>
.about-page {
  padding: 2rem 1rem;
  min-height: calc(100vh - var(--header-height));
}

.about-content {
  max-width: 1200px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  margin-bottom: 2rem;
}

.about-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
  color: var(--c-text-1);
}

.about-subtitle {
  font-size: 1.1rem;
  color: var(--c-text-2);
  margin: 0;
}

.about-profile-card {
  background-color: var(--c-bg-2);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
}

.about-profile-greeting {
  font-size: 1.2rem;
  margin: 0 0 1rem 0;
  color: var(--c-text-2);
}

.about-profile-name {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--c-text-1);
}

.about-profile-info {
  font-size: 1rem;
  color: var(--c-text-2);
  margin: 0;
}

.about-rocket-icon {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 2rem;
  color: var(--c-primary);
  opacity: 0.7;
}

.about-tags-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.about-tag-card {
  background-color: var(--c-bg-2);
  border-radius: 1rem;
  padding: 1.5rem;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
}

.about-tag-title {
  font-size: 0.9rem;
  color: var(--c-text-3);
  margin-bottom: 0.5rem;
}

.about-tag-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--c-text-1);
  margin-bottom: 0.3rem;
}

.about-tag-subtitle {
  font-size: 0.9rem;
  color: var(--c-text-3);
  margin-bottom: 0.3rem;
}

.about-tag-subvalue {
  font-size: 0.95rem;
  color: var(--c-text-2);
}

.about-tag-icon {
  position: absolute;
  right: 1.5rem;
  bottom: 1.5rem;
  font-size: 1.5rem;
  color: var(--c-primary);
  opacity: 0.6;
}

.about-tag-link {
  margin-top: 0.5rem;
}

.about-link-text {
  font-size: 0.85rem;
  color: var(--c-primary);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
}

.about-contact-section {
  margin-bottom: 2rem;
}

.about-section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--c-text-1);
  margin-bottom: 1rem;
}

.about-contact-icons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  background-color: var(--c-bg-2);
  border-radius: 1rem;
  padding: 1.5rem;
}

.about-contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  background-color: var(--c-bg-1);
  border-radius: 50%;
  color: var(--c-text-1);
  font-size: 1.2rem;
  transition: all 0.2s;
  
  &:hover {
    background-color: var(--c-primary);
    color: white;
    transform: translateY(-2px);
  }
}

.about-stats-section {
  margin-bottom: 2rem;
}

.about-stats-card {
  background-color: var(--c-bg-2);
  border-radius: 1rem;
  padding: 1.5rem;
}

.about-stats-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--c-text-1);
  margin-bottom: 1rem;
}

.about-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.about-stat-item {
  text-align: center;
  position: relative;
}

.about-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--c-text-1);
  margin-bottom: 0.3rem;
}

.about-stat-label {
  font-size: 0.9rem;
  color: var(--c-text-2);
}

.about-stat-chart {
  position: absolute;
  right: 0;
  top: 0;
  font-size: 1.2rem;
  color: var(--c-primary);
  opacity: 0.6;
}

@media (max-width: 768px) {
  .about-page {
    padding: 1rem;
  }
  
  .about-title {
    font-size: 2rem;
  }
  
  .about-tags-grid {
    grid-template-columns: 1fr;
  }
  
  .about-rocket-icon {
    position: static;
    transform: none;
    margin-top: 1rem;
  }
  
  .about-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
