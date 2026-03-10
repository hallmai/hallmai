import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Device } from './device.entity'

export type Vibe = 'warm' | 'calm' | 'quiet'

export interface DailyStoryData {
  topic: string
  quote: string
  vibe: Vibe
}

@Entity('story_cards')
export class StoryCard extends BaseEntity {
  @Index()
  @Column({ name: 'device_id', type: 'int' })
  deviceId: number

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device

  @Column({ type: 'varchar', length: 30, default: 'daily_story' })
  type: string

  @Column({ name: 'carded_at', type: 'timestamptz' })
  cardedAt: Date

  @Column({ type: 'jsonb' })
  data: DailyStoryData
}
