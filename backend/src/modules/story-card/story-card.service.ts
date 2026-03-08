import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Between, Repository } from 'typeorm'
import {
  DailyStoryData,
  StoryCard
} from '../../common/entity/story-card.entity'

@Injectable()
export class StoryCardService {
  constructor(
    @InjectRepository(StoryCard)
    private readonly storyCardRepository: Repository<StoryCard>
  ) {}

  async create(
    deviceId: number,
    cardedAt: Date,
    data: DailyStoryData
  ): Promise<StoryCard> {
    const card = this.storyCardRepository.create({
      deviceId,
      cardedAt,
      data
    })
    return this.storyCardRepository.save(card)
  }

  async findByDeviceId(deviceId: number, limit = 30): Promise<StoryCard[]> {
    return this.storyCardRepository.find({
      where: { deviceId },
      order: { cardedAt: 'DESC' },
      take: limit
    })
  }

  async existsForDate(deviceId: number, cardedAt: Date): Promise<boolean> {
    const start = new Date(cardedAt)
    start.setHours(0, 0, 0, 0)
    const end = new Date(cardedAt)
    end.setHours(23, 59, 59, 999)

    const count = await this.storyCardRepository.count({
      where: {
        deviceId,
        cardedAt: Between(start, end)
      }
    })
    return count > 0
  }
}
