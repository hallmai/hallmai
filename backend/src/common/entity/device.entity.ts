import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { User } from './user.entity'

@Entity('devices')
export class Device extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'device_uuid', type: 'varchar', length: 255 })
  deviceUuid: string

  @Column({ name: 'nickname', type: 'varchar', length: 20, nullable: true })
  nickname: string | null

  @Column({ name: 'link_code', type: 'varchar', length: 6, nullable: true })
  linkCode: string | null

  @Column({ name: 'link_code_expires_at', type: 'datetime', nullable: true })
  linkCodeExpiresAt: Date | null

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null

  @Column({ name: 'linked_at', type: 'datetime', nullable: true })
  linkedAt: Date | null
}
