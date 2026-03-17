import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { SkipThrottle } from '@nestjs/throttler'
import { InjectRepository } from '@nestjs/typeorm'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway
} from '@nestjs/websockets'
import type { IncomingMessage } from 'http'
import { Repository } from 'typeorm'
import type WebSocket from 'ws'
import { Device } from '../../common/entity/device.entity'
import { ConversationService } from '../conversation/conversation.service'
import { SoulService } from '../soul/soul.service'
import { VoiceService } from './voice.service'
import { YoutubeService } from './youtube.service'

interface WsMessage {
  event: string
  data?: Record<string, unknown>
}

interface ClientSession {
  conversationId: number
  deviceId: number
  rootConversationId: number
}

@SkipThrottle()
@WebSocketGateway({ path: '/ws/voice' })
export class VoiceGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(VoiceGateway.name)
  private readonly clientSessions = new Map<WebSocket, ClientSession>()

  constructor(
    private readonly voiceService: VoiceService,
    private readonly conversationService: ConversationService,
    private readonly soulService: SoulService,
    private readonly jwtService: JwtService,
    private readonly youtubeService: YoutubeService,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>
  ) {}

  afterInit(): void {
    this.voiceService.registerTool('searchYoutube', async (args) => {
      const query = args.query as string
      const results = await this.youtubeService.search(query)
      if (results.length === 0) return { error: '검색 결과가 없습니다' }
      return {
        results: results.map((r, i) => ({
          index: i + 1,
          videoId: r.videoId,
          title: r.title
        }))
      }
    })

    this.voiceService.registerTool('playYoutube', async (args) => {
      const videoId = args.videoId as string
      const title = args.title as string
      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return { error: 'Invalid video ID' }
      }
      return { videoId, title }
    })
  }

  handleConnection(client: WebSocket, req: IncomingMessage): void {
    const url = new URL(req.url || '', `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    // JWT is optional: family members have it, seniors don't
    if (token) {
      try {
        const payload = this.jwtService.verify<{ sub: number }>(token)
        ;(client as unknown as { userId: number }).userId = payload.sub
        this.logger.debug('Client connected (authenticated)')
      } catch {
        client.close(4001, 'Invalid token')
        return
      }
    } else {
      this.logger.debug('Client connected (device mode)')
    }

    client.on('message', (raw: Buffer | string) => {
      try {
        const msg = JSON.parse(raw.toString()) as WsMessage
        this.handleMessage(client, msg).catch((err) =>
          this.logger.error(`Message handler error: ${String(err)}`)
        )
      } catch (err) {
        this.logger.error(`Message parse error: ${String(err)}`)
      }
    })
  }

  async handleDisconnect(client: WebSocket): Promise<void> {
    this.logger.debug('Client disconnected')
    try {
      await this.endConversation(client)
    } finally {
      this.voiceService.endSession(client)
    }
  }

  private async handleMessage(
    client: WebSocket,
    msg: WsMessage
  ): Promise<void> {
    switch (msg.event) {
      case 'start':
        await this.handleStart(client, msg.data)
        break
      case 'audio':
        this.handleAudio(client, msg.data)
        break
      case 'end':
        await this.handleEnd(client)
        break
      case 'hotkey':
        this.handleHotkey(client, msg.data)
        break
      default:
        this.logger.warn(`Unknown event: ${msg.event}`)
    }
  }

  private async handleStart(
    client: WebSocket,
    data?: Record<string, unknown>
  ): Promise<void> {
    const deviceUuid = data?.deviceUuid as string
    if (!deviceUuid) {
      client.close(4001, 'deviceUuid required')
      return
    }

    const device = await this.deviceRepository.findOneBy({ deviceUuid })
    if (!device) {
      client.close(4001, 'Device not found')
      return
    }

    const resumeFrom = data?.resumeFrom as number | undefined

    try {
      // Load soul context + recent summaries in parallel for system prompt
      const [{ profileText, maturity }, recentSummaries] = await Promise.all([
        this.soulService.getProfileWithMaturity(device.id),
        this.conversationService.getRecentSummaries(device.id, 2)
      ])
      this.logger.debug(`Soul maturity: ${maturity} for device ${deviceUuid}`)
      const soulContext = profileText ?? undefined

      // Build resume context from previous conversation transcript
      let resumeContext: string | undefined
      let rootId: number | undefined
      if (resumeFrom) {
        const prevConversation =
          await this.conversationService.findById(resumeFrom)
        rootId = prevConversation?.rootConversationId ?? undefined
        if (prevConversation?.transcript?.length) {
          const lines = prevConversation.transcript
            .filter((e) => e.role === 'user' || e.role === 'ai')
            .slice(-10)
            .map((e) => `${e.role === 'user' ? '사용자' : '할마이'}: ${e.text}`)
            .join('\n')
          resumeContext = `## 이어서 대화하기\n방금 유튜브 영상을 시청하고 돌아왔습니다. 아래 직전 대화 내용을 참고해서 자연스럽게 이어서 대화하세요.\n첫 인사를 다시 하지 마세요. "영상 잘 보셨어요?" 같은 가벼운 말로 이어가세요.\n\n### 직전 대화\n${lines}`
        }
      }

      const photoBase64 = data?.photoBase64 as string | undefined
      const photoMimeType = data?.photoMimeType as string | undefined
      const ALLOWED_PHOTO_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp'
      ] as const
      const MAX_PHOTO_BASE64_LENGTH = 2_000_000 // ~1.5MB decoded
      const hasPhoto = !!(
        photoBase64 &&
        photoMimeType &&
        ALLOWED_PHOTO_TYPES.includes(
          photoMimeType as (typeof ALLOWED_PHOTO_TYPES)[number]
        ) &&
        photoBase64.length <= MAX_PHOTO_BASE64_LENGTH
      )

      await this.voiceService.startSession(
        client,
        deviceUuid,
        soulContext,
        recentSummaries.length ? recentSummaries : undefined,
        maturity,
        resumeContext,
        hasPhoto
      )

      if (hasPhoto) {
        this.voiceService.sendPhoto(client, photoBase64, photoMimeType)
      }

      // Wire silence timeout to auto-end conversation
      this.voiceService.setSilenceCallback(client, () => {
        void (async () => {
          try {
            await this.endConversation(client)
          } catch (err) {
            this.logger.error(`Silence end conversation error: ${String(err)}`)
          } finally {
            this.voiceService.endSession(client)
          }
        })()
      })

      // Wire session renewal to handle long conversations
      this.voiceService.setRenewalHandler(client, () => {
        void (async () => {
          try {
            await this.handleSessionRenewal(client)
          } catch (err) {
            this.logger.error(`Session renewal error: ${String(err)}`)
            this.voiceService.resetRenewalState(client)
          }
        })()
      })
      const conversation = await this.conversationService.create(
        device.id,
        rootId
      )
      this.clientSessions.set(client, {
        conversationId: conversation.id,
        deviceId: device.id,
        rootConversationId: conversation.rootConversationId ?? conversation.id
      })
      this.voiceService.setConversationId(client, conversation.id)

      // Client may have disconnected during async setup
      if (client.readyState !== 1) {
        this.logger.debug(
          'Client disconnected during session setup, cleaning up'
        )
        await this.endConversation(client)
        this.voiceService.endSession(client)
        return
      }
    } catch (err) {
      this.logger.error(`Failed to start session: ${String(err)}`)
      this.send(client, 'error', { message: 'Failed to connect to AI' })
      this.voiceService.endSession(client)
    }
  }

  private handleAudio(client: WebSocket, data?: Record<string, unknown>): void {
    const audioData = data?.data as string
    if (!audioData) return
    this.voiceService.sendAudio(client, audioData)
  }

  private handleHotkey(
    client: WebSocket,
    data?: Record<string, unknown>
  ): void {
    const prompt = data?.prompt as string
    if (!prompt) return
    this.voiceService.sendHotkeyPrompt(client, prompt)
  }

  private async handleEnd(client: WebSocket): Promise<void> {
    try {
      await this.endConversation(client)
    } finally {
      this.voiceService.endSession(client)
    }
  }

  private async handleSessionRenewal(client: WebSocket): Promise<void> {
    const clientSession = this.clientSessions.get(client)
    if (!clientSession) return

    const { conversationId, deviceId, rootConversationId } = clientSession
    const session = this.voiceService.getSession(client)
    const transcript = session?.transcript?.length
      ? [...session.transcript]
      : null

    // 1. Save current conversation
    await this.conversationService.end(conversationId, transcript)

    // 2. Generate summary (synchronous — need result for recent summaries)
    if (transcript?.length) {
      await this.conversationService.summarizeAndReturn(
        conversationId,
        transcript
      )
    }

    // 3. Soul extraction (fire-and-forget)
    if (transcript?.length) {
      this.soulService
        .extract(deviceId, conversationId, transcript)
        .catch((err) =>
          this.logger.error(
            `Soul extraction failed during renewal: ${String(err)}`
          )
        )
    }

    // 4. Create new conversation with rootConversationId
    const newConversation = await this.conversationService.create(
      deviceId,
      rootConversationId
    )

    // 5. Reload soul context + recent summaries
    const [{ profileText, maturity }, recentSummaries] = await Promise.all([
      this.soulService.getProfileWithMaturity(deviceId),
      this.conversationService.getRecentSummaries(deviceId, 2)
    ])

    // 6. Build resume context from transcript
    let resumeContext: string | undefined
    if (transcript?.length) {
      const lines = transcript
        .filter((e) => e.role === 'user' || e.role === 'ai')
        .slice(-6)
        .map((e) => `${e.role === 'user' ? '사용자' : '할마이'}: ${e.text}`)
        .join('\n')
      resumeContext = `## 이어서 대화하기\n아래는 방금 직전까지의 대화입니다. 자연스럽게 이어서 대화하세요.\n\n${lines}`
    }

    // 7. Renew Gemini session
    await this.voiceService.renewSession(
      client,
      profileText ?? undefined,
      recentSummaries.length ? recentSummaries : undefined,
      maturity,
      resumeContext
    )

    // 8. Update client sessions
    this.clientSessions.set(client, {
      conversationId: newConversation.id,
      deviceId,
      rootConversationId
    })
    this.voiceService.setConversationId(client, newConversation.id)

    this.logger.log(
      `Session renewed: conversation ${conversationId} → ${newConversation.id}`
    )
  }

  private async endConversation(client: WebSocket): Promise<void> {
    const clientSession = this.clientSessions.get(client)
    if (!clientSession) return
    this.clientSessions.delete(client) // Atomic guard against concurrent calls

    const { conversationId, deviceId } = clientSession
    const session = this.voiceService.getSession(client)
    const transcript = session?.transcript?.length ? session.transcript : null

    await this.conversationService.end(conversationId, transcript)

    if (transcript?.length) {
      // Soul extraction fire-and-forget
      this.soulService
        .extract(deviceId, conversationId, transcript)
        .catch((err) =>
          this.logger.error(
            `Soul extraction failed for device ${deviceId}: ${String(err)}`
          )
        )

      // Summary generation fire-and-forget
      this.conversationService
        .summarize(conversationId, transcript)
        .catch((err) =>
          this.logger.error(
            `Summary generation failed for conversation ${conversationId}: ${String(err)}`
          )
        )
    }
  }

  private send(
    client: WebSocket,
    event: string,
    data: Record<string, unknown>
  ): void {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ event, data }))
    }
  }
}
