import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common'
import { CustomHttpException } from '../../common/response/custom-http.exception'
import { ErrorCode } from '../../common/response/error-code.enum'
import { JwtPayload } from '../auth/auth.service'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { DeviceService } from '../device/device.service'
import { StoryCardService } from './story-card.service'

@Controller('story-cards')
export class StoryCardController {
  constructor(
    private readonly storyCardService: StoryCardService,
    private readonly deviceService: DeviceService
  ) {}

  @Get(':devicePid')
  @UseGuards(JwtAuthGuard)
  async getCards(
    @CurrentUser() user: JwtPayload,
    @Param('devicePid') devicePid: string
  ) {
    // Verify the device belongs to this user
    const devices = await this.deviceService.getLinkedDevices(user.sub)
    const device = devices.find((d) => d.pid === devicePid)

    if (!device) {
      throw new CustomHttpException(
        HttpStatus.FORBIDDEN,
        ErrorCode.FORBIDDEN,
        'Access denied to this device'
      )
    }

    const cards = await this.storyCardService.findByDeviceId(device.id)
    return {
      cards: cards.map((c) => ({
        pid: c.pid,
        type: c.type,
        cardedAt: c.cardedAt,
        data: c.data,
        createdAt: c.createdAt
      }))
    }
  }
}
