import { Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway
} from '@nestjs/websockets'
import { Repository } from 'typeorm'
import type WebSocket from 'ws'
import { Device } from '../../common/entity/device.entity'
import { ConversationService } from '../conversation/conversation.service'
import { VoiceService } from './voice.service'

interface WsMessage {
  event: string
  data?: Record<string, unknown>
}

// Track active conversation per client
const clientConversations = new Map<WebSocket, number>()

@WebSocketGateway({ path: '/ws/voice' })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(VoiceGateway.name)

  constructor(
    private readonly voiceService: VoiceService,
    private readonly conversationService: ConversationService,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>
  ) {}

  handleConnection(client: WebSocket): void {
    this.logger.debug('Client connected')

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
    await this.endConversation(client)
    this.voiceService.endSession(client)
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
        await this.handleAudio(client, msg.data)
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
      await this.voiceService.startSession(client, deviceUuid)

      // Create conversation record
      const conversation = await this.conversationService.create(device.id)
      clientConversations.set(client, conversation.id)
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
    await this.endConversation(client)
    this.voiceService.endSession(client)
  }

  private async endConversation(client: WebSocket): Promise<void> {
    const conversationId = clientConversations.get(client)
    if (!conversationId) return

    const session = this.voiceService.getSession(client)
    const transcript = session?.transcript || null

    await this.conversationService.end(conversationId, transcript)
    clientConversations.delete(client)
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
