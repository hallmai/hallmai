import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { JwtPayload } from '../auth/auth.service'
import { CurrentUser } from '../auth/current-user.decorator'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { DeviceService } from './device.service'

class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceUuid: string
}

class LinkDeviceDto {
  @IsString()
  @IsNotEmpty()
  code: string

  @IsString()
  @IsOptional()
  @MaxLength(20)
  nickname?: string
}

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post('register')
  async register(@Body() dto: RegisterDeviceDto) {
    return this.deviceService.register(dto.deviceUuid)
  }

  @Post('link')
  @UseGuards(JwtAuthGuard)
  async link(@CurrentUser() user: JwtPayload, @Body() dto: LinkDeviceDto) {
    return this.deviceService.link(user.sub, dto.code, dto.nickname)
  }

  @Get('status/:code')
  async status(@Param('code') code: string) {
    return this.deviceService.getStatus(code)
  }

  @Get('linked')
  @UseGuards(JwtAuthGuard)
  async linked(@CurrentUser() user: JwtPayload) {
    const devices = await this.deviceService.getLinkedDevices(user.sub)
    return {
      devices: devices.map((d) => ({
        pid: d.pid,
        deviceUuid: d.deviceUuid,
        nickname: d.nickname,
        linkedAt: d.linkedAt
      }))
    }
  }
}
