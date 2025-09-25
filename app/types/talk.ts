export type TalkItem = {
  content: String
  date: String
  tags?: String[]
  location?: String
  videoEmbed?: {
    type: 'raw' | 'bilibili' | string
    id: string
    poster?: string
  }
  images?: string | string[]
}