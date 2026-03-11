import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import { Conversation } from '../../common/entity/conversation.entity'

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>
  ) {}

  async create(deviceId: number): Promise<Conversation> {
    const conversation = this.conversationRepository.create({
      deviceId,
      startedAt: new Date()
    })
    return this.conversationRepository.save(conversation)
  }

  async end(
    id: number,
    transcript: string | null,
    thinking: string | null
  ): Promise<void> {
    const now = new Date()
    const conversation = await this.conversationRepository.findOneBy({ id })
    if (!conversation) return

    const durationSeconds = Math.round(
      (now.getTime() - conversation.startedAt.getTime()) / 1000
    )

    await this.conversationRepository.update(id, {
      endedAt: now,
      durationSeconds,
      transcript: transcript || null,
      thinking: thinking || null
    })
  }

  async findByDeviceAndDateRange(
    deviceId: number,
    start: Date,
    end: Date
  ): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: {
        deviceId,
        startedAt: Between(start, end)
      }
    })
  }
}
