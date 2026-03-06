import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { AuthToken } from './auth-token.entity'
import { Device } from './device.entity'
import { Post } from './post.entity'
import { User } from './user.entity'

export const entities: EntityClassOrSchema[] = [User, AuthToken, Post, Device]
