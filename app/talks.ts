import type { TalkItem } from '~/types/talk'

export default [
  {
    text: '这是一个包含<b>原始视频</b>的动态内容示例。<br>现在支持使用&lt;br&gt;进行换行和使用&lt;b&gt;标签实现加粗。',
    date: '2025-09-24 00:00',
    video: {
      id: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
      poster: 'https://lf-package-cn.feishucdn.com/obj/atsx-throne/hire-fe-prod/portal/i18n/static/image/video-poster.d9fdf4be.jpeg'
    },
    tags: ['游戏'],
    location: '天津'
  },
  {
    text: '这是一个包含B站视频的示例。',
    date: '2025-09-23 23:00',
    video: {
      type: 'bilibili',
      id: 'BV1Yr421p7rW'
    },
    tags: ['网站'],
    location: '天津'
  },
  {
    text: '这是一个同时包含<b>视频</b>和<b>图片</b>的示例。<br>支持多种媒体格式的展示。',
    date: '1885-07-22 20:00',
    images: [
      'https://bu.dusays.com/2025/09/05/68ba9c061a069.webp',
      'https://bu.dusays.com/2025/09/05/68ba9cc68cbe0.webp',
      'https://bu.dusays.com/2025/09/05/68ba9cc68cbe0.webp'
    ],
    video: {
      type: 'bilibili',
      id: 'BV1xx411c7mD'
    },
    tags: ['旅行'],
    location: '成都'
  }
] satisfies TalkItem[]
