import { Controller, Get, Param, Query } from '@nestjs/common'
import { PostCategory } from '../../common/entity/post.entity'
import { PostService } from './post.service'

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get('latest')
  async findLatest(@Query('category') category: PostCategory) {
    const post = await this.postService.findLatestByCategory(category)
    return {
      post: post
        ? {
            pid: post.pid,
            category: post.category,
            title: post.title,
            content: post.content,
            createdAt: post.createdAt
          }
        : null
    }
  }

  @Get(':pid')
  async findByPid(@Param('pid') pid: string) {
    const post = await this.postService.findByPid(pid)
    return {
      post: {
        pid: post.pid,
        category: post.category,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt
      }
    }
  }
}
