import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Device } from './device.entity'

export interface TranscriptEntry {
  role: 'user' | 'ai' | 'tool'
  text: string
  thinking?: string
  toolName?: string
  toolCallId?: string
  toolArgs?: Record<string, unknown>
  toolResult?: Record<string, unknown>
  toolStatus?: 'pending' | 'completed' | 'cancelled' | 'error'
}

@Entity('conversations')
export class Conversation extends BaseEntity {
  @Index()
  @Column({ name: 'device_id', type: 'int' })
  deviceId: number

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt: Date | null

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null

  @Column({ type: 'jsonb', nullable: true })
  transcript: TranscriptEntry[] | null

  @Column({ type: 'text', nullable: true })
  summary: string | null
}
