import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm'
import { Post, PostCategory } from '../../common/entity/post.entity'
import { CustomHttpException } from '../../common/response/custom-http.exception'
import { ErrorCode } from '../../common/response/error-code.enum'

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>
  ) {}

  private publishedWhere(category: PostCategory) {
    const now = new Date()
    return {
      category,
      startedAt: LessThanOrEqual(now),
      endedAt: MoreThanOrEqual(now)
    }
  }

  async findLatestByCategory(category: PostCategory): Promise<Post | null> {
    return this.postRepository.findOne({
      where: this.publishedWhere(category),
      order: { createdAt: 'DESC' }
    })
  }

  async findByPid(pid: string): Promise<Post> {
    const now = new Date()
    const post = await this.postRepository.findOne({
      where: {
        pid,
        startedAt: LessThanOrEqual(now),
        endedAt: MoreThanOrEqual(now)
      }
    })
    if (!post) throw new CustomHttpException(HttpStatus.NOT_FOUND, ErrorCode.ENTITY_NOT_FOUND, '게시글을 찾을 수 없습니다')
    return post
  }
}
