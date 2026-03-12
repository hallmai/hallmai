import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomInt } from 'crypto'
import { IsNull, Not, Repository } from 'typeorm'
import { uuidv7 } from 'uuidv7'
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
    deviceUuid: string
  ): Promise<
    | { linked: true; nickname: string | null; linkedAt: Date }
    | { linked: false; code: string; expiresAt: Date }
  > {
    // Insert if not exists, do nothing on conflict
    await this.deviceRepository
      .createQueryBuilder()
      .insert()
      .values({ deviceUuid, pid: uuidv7() })
      .orIgnore()
      .execute()
    const device = await this.deviceRepository.findOneByOrFail({ deviceUuid })

    // 이미 연결된 디바이스면 연결 정보 반환
    if (device.linkedAt) {
      return {
        linked: true,
        nickname: device.nickname,
        linkedAt: device.linkedAt
      }
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

    device.linkCode = await this.generateUniqueCode()
    device.linkCodeExpiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30분
    await this.deviceRepository.save(device)

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

  private async generateUniqueCode(): Promise<string> {
    const maxAttempts = 5
    const maxLength = 6 // link_code varchar(6)

    for (let length = 4; length <= maxLength; length++) {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = this.generateCode(length)
        const existing = await this.deviceRepository.findOneBy({
          linkCode: code
        })
        if (
          !existing ||
          (existing.linkCodeExpiresAt &&
            existing.linkCodeExpiresAt < new Date())
        ) {
          return code
        }
      }
    }
    throw new Error('Failed to generate unique link code')
  }

  private generateCode(length: number): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 혼동 문자 제외 (0/O, 1/I)
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars[randomInt(chars.length)]
    }
    return code
  }
}
