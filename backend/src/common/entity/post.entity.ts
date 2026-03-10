import { Column, Entity } from 'typeorm'
import { BaseEntity } from './base.entity'

export enum PostCategory {
  NOTICE = 'NOTICE',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY',
  MARKETING_TERMS = 'MARKETING_TERMS'
}

@Entity('posts')
export class Post extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  category: PostCategory

  @Column({ type: 'varchar', length: 255 })
  title: string

  @Column({ type: 'text' })
  content: string

  @Column({ type: 'int', default: 0 })
  sort: number

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date

  @Column({ name: 'ended_at', type: 'timestamptz' })
  endedAt: Date
}
