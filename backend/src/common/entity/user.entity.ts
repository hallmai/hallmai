import { Column, Entity } from 'typeorm'
import { BaseEntity } from './base.entity'

@Entity('users')
export class User extends BaseEntity {
  @Column({ name: 'google_id', type: 'varchar', length: 255, unique: true })
  googleId: string

  @Column({ type: 'varchar', length: 255 })
  email: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ name: 'profile_image', type: 'varchar', length: 512, nullable: true })
  profileImage: string | null

  @Column({
    type: 'enum',
    enum: ['senior', 'child'],
    default: 'child'
  })
  role: 'senior' | 'child'

  @Column({ name: 'marketing_agreed_at', type: 'timestamp', nullable: true })
  marketingAgreedAt: Date | null
}
