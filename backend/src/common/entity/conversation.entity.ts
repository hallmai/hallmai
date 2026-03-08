import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Device } from './device.entity'

@Entity('conversations')
export class Conversation extends BaseEntity {
  @Index()
  @Column({ name: 'device_id', type: 'int' })
  deviceId: number

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device

  @Column({ name: 'started_at', type: 'datetime' })
  startedAt: Date

  @Column({ name: 'ended_at', type: 'datetime', nullable: true })
  endedAt: Date | null

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number | null

  @Column({ type: 'longtext', nullable: true })
  transcript: string | null
}
