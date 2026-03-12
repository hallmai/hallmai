import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type'
import { AuthToken } from './auth-token.entity'
import { Conversation } from './conversation.entity'
import { DeviceSoul } from './device-soul.entity'
import { Device } from './device.entity'
import { Post } from './post.entity'
import { StoryCard } from './story-card.entity'
import { User } from './user.entity'

export const entities: EntityClassOrSchema[] = [
  User,
  AuthToken,
  Post,
  Device,
  DeviceSoul,
  Conversation,
  StoryCard
]
