import type { TalkItem } from '~/types/talk'

export default [
  {
    content: '测试内容 C。',
    date: '2025-09-24 00:00',
    tags: ['游戏'],
    location: '天津'
  },
  {
    content: '测试内容 B。',
    date: '2025-09-23 23:00',
    tags: ['网站'],
    location: '天津'
  },
  {
    content: '测试内容 A。',
    date: '2025-09-23 22:00',
    tags: ['火车'],
    location: '重庆'
  }
] satisfies TalkItem[]
