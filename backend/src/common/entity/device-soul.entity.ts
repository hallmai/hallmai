import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { Conversation } from './conversation.entity'
import { Device } from './device.entity'

export interface SoulProfile {
  // === AI Soul (AI의 자아/관계성) ===
  tone?: string // 이 분과의 대화 톤 ("유머 잘 받아주셔서 장난스럽게", "차분하고 다정하게")
  sharedMemories?: string[] // 공유 기억/에피소드
  strategies?: string[] // 대화 전략

  // === User Profile (시니어 정보) ===
  interests?: string[] // 관심사/취미
  family?: string[] // 가족 관계
  routines?: string[] // 일상 패턴
  emotions?: string[] // 감정 경향
  preferences?: string[] // 대화 선호
}

@Entity('device_souls')
export class DeviceSoul extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'device_id', type: 'int' })
  deviceId: number

  @ManyToOne(() => Device)
  @JoinColumn({ name: 'device_id' })
  device: Device

  @Column({ type: 'jsonb', default: () => "'{}'" })
  profile: SoulProfile

  @Column({ name: 'last_conversation_id', type: 'int', nullable: true })
  lastConversationId: number | null

  @ManyToOne(() => Conversation, { nullable: true })
  @JoinColumn({ name: 'last_conversation_id' })
  lastConversation: Conversation | null
}
