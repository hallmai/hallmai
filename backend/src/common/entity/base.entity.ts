import {
  Column,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity as _BaseEntity
} from 'typeorm'
import { uuidv7 } from 'uuidv7'

export class BaseEntity extends _BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column({ type: 'varchar', length: 36, unique: true })
  pid: string = uuidv7()

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
  })
  updatedAt: Date

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null
}
