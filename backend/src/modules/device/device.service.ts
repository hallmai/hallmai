import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomInt } from 'crypto'
import { IsNull, Not, Repository } from 'typeorm'
import { Device } from '../../common/entity/device.entity'
import { CustomHttpException } from '../../common/response/custom-http.exception'
import { ErrorCode } from '../../common/response/error-code.enum'

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>
  ) {}

  async register(
    deviceUuid: string,
    retryCount = 0
  ): Promise<
    | { linked: true; nickname: string | null; linkedAt: Date }
    | { linked: false; code: string; expiresAt: Date }
  > {
    let device = await this.deviceRepository.findOneBy({ deviceUuid })

    // 이미 연결된 디바이스면 연결 정보 반환
    if (device?.linkedAt) {
      return {
        linked: true,
        nickname: device.nickname,
        linkedAt: device.linkedAt
      }
    }

    if (!device) {
      device = this.deviceRepository.create({ deviceUuid })
    }

    // 유효한 코드가 이미 있으면 재사용
    if (
      device.linkCode &&
      device.linkCodeExpiresAt &&
      device.linkCodeExpiresAt > new Date()
    ) {
      return {
        linked: false,
        code: device.linkCode,
        expiresAt: device.linkCodeExpiresAt
      }
    }

    device.linkCode = this.generateCode()
    device.linkCodeExpiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30분
    try {
      await this.deviceRepository.save(device)
    } catch (error) {
      if (
        (error as { code?: string }).code === 'ER_DUP_ENTRY' &&
        retryCount < 3
      ) {
        return this.register(deviceUuid, retryCount + 1)
      }
      throw error
    }

    return {
      linked: false,
      code: device.linkCode,
      expiresAt: device.linkCodeExpiresAt
    }
  }

  async link(userId: number, code: string, nickname?: string) {
    const device = await this.deviceRepository.findOneBy({ linkCode: code })

    if (!device) {
      throw new CustomHttpException(
        HttpStatus.NOT_FOUND,
        ErrorCode.ENTITY_NOT_FOUND,
        '유효하지 않은 연결 코드입니다'
      )
    }

    if (device.linkCodeExpiresAt && device.linkCodeExpiresAt < new Date()) {
      throw new CustomHttpException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION,
        '만료된 연결 코드입니다'
      )
    }

    device.userId = userId
    device.nickname = nickname || null
    device.linkedAt = new Date()
    device.linkCode = null
    device.linkCodeExpiresAt = null
    await this.deviceRepository.save(device)

    return {
      devicePid: device.pid,
      linkedAt: device.linkedAt
    }
  }

  async getStatus(code: string) {
    const device = await this.deviceRepository.findOne({
      where: { linkCode: code },
      relations: ['user']
    })

    if (!device) {
      return { linked: false }
    }

    if (device.userId) {
      return {
        linked: true,
        childName: device.user?.name ?? null
      }
    }

    return { linked: false }
  }

  async getLinkedDevices(userId: number) {
    return this.deviceRepository.find({
      where: { userId, linkedAt: Not(IsNull()) }
    })
  }

  private generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동 문자 제외 (0/O, 1/I)
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[randomInt(chars.length)]
    }
    return code
  }
}
