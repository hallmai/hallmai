import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { User } from './user.entity'

@Entity('auth_tokens')
@Index('ix_auth_tokens_provider', ['providerType', 'providerUserId'])
export class AuthToken extends BaseEntity {
  @Column({ name: 'user_id', type: 'int' })
  userId: number

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User

  @Column({ name: 'provider_type', type: 'varchar', length: 50 })
  providerType: string

  @Column({ name: 'provider_user_id', type: 'varchar', length: 255 })
  providerUserId: string

  @Column({ name: 'provider_data_json', type: 'json' })
  providerDataJson: Record<string, unknown>

  @Column({ name: 'refresh_token', type: 'varchar', length: 255, unique: true })
  refreshToken: string

  @Column({ name: 'expired_at', type: 'datetime', nullable: true })
  expiredAt: Date | null

  @Column({
    name: 'last_activated_at',
    type: 'datetime',
    default: () => 'NOW()'
  })
  lastActivatedAt: Date
}
