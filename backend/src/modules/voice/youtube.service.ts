import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

interface YoutubeSearchResult {
  videoId: string
  title: string
}

interface YoutubeApiResponse {
  items?: Array<{
    id: { videoId: string }
    snippet: { title: string }
  }>
}

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name)

  constructor(private readonly config: ConfigService) {}

  async search(query: string, maxResults = 3): Promise<YoutubeSearchResult[]> {
    const key = this.config.get<string>('YOUTUBE_API_KEY')
    if (!key) {
      this.logger.warn('YOUTUBE_API_KEY not configured')
      return []
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&safeSearch=strict&regionCode=KR&relevanceLanguage=ko&key=${key}`

    try {
      const res = await fetch(url)
      if (!res.ok) {
        this.logger.error(`YouTube API error: ${res.status} ${res.statusText}`)
        return []
      }
      const data = (await res.json()) as YoutubeApiResponse
      return (
        data.items
          ?.filter((item) => item.id.videoId)
          .map((item) => ({
            videoId: item.id.videoId,
            title: item.snippet.title
          })) ?? []
      )
    } catch (err) {
      this.logger.error(`YouTube search failed: ${String(err)}`)
      return []
    }
  }
}
