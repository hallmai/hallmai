import { Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway
} from '@nestjs/websockets'
import type { IncomingMessage } from 'http'
import { Repository } from 'typeorm'
import type WebSocket from 'ws'
import { Device } from '../../common/entity/device.entity'
import { ConversationService } from '../conversation/conversation.service'
import { SoulService } from '../soul/soul.service'
import { VoiceService } from './voice.service'

interface WsMessage {
  event: string
  data?: Record<string, unknown>
}

interface ClientSession {
  conversationId: number
  deviceId: number
}

@WebSocketGateway({ path: '/ws/voice' })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(VoiceGateway.name)
  private readonly clientSessions = new Map<WebSocket, ClientSession>()

  constructor(
    private readonly voiceService: VoiceService,
    private readonly conversationService: ConversationService,
    private readonly soulService: SoulService,
    private readonly jwtService: JwtService,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>
  ) {}

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
        void this.handleMessage(client, msg)
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

    try {
      // Load soul context + recent summaries for system prompt
      const soulContext =
        (await this.soulService.getProfileText(device.id)) ?? undefined
      const recentSummaries = await this.conversationService.getRecentSummaries(
        device.id,
        3
      )
      await this.voiceService.startSession(
        client,
        deviceUuid,
        soulContext,
        recentSummaries.length ? recentSummaries : undefined
      )

      // Wire silence timeout to auto-end conversation
      this.voiceService.setSilenceCallback(client, () => {
        void (async () => {
          await this.endConversation(client)
          this.voiceService.endSession(client)
        })()
      })

      // Create conversation record
      const conversation = await this.conversationService.create(device.id)
      this.clientSessions.set(client, {
        conversationId: conversation.id,
        deviceId: device.id
      })
    } catch (err) {
      this.logger.error(`Failed to start session: ${String(err)}`)
      this.send(client, 'error', { message: 'Failed to connect to AI' })
    }
  }

  private handleAudio(client: WebSocket, data?: Record<string, unknown>): void {
    const audioData = data?.data as string
    if (!audioData) return
    this.voiceService.sendAudio(client, audioData)
  }

  private async handleEnd(client: WebSocket): Promise<void> {
    try {
      await this.endConversation(client)
    } finally {
      this.voiceService.endSession(client)
    }
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
