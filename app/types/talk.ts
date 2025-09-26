export type TalkItem = {
  date: string
  text?: string
  images?: string[]
  video?: {
    type?: 'raw' | 'bilibili' | 'bilibili-nano' | 'youtube' | 'douyin' | 'douyin-wide' | 'tiktok'
    id: string
    ratio?: string | number
    poster?: string
  }
  tags?: string[]
  location?: string
}
