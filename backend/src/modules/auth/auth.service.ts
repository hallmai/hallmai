import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { randomBytes } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import { Repository } from 'typeorm'
import { AuthToken } from '../../common/entity/auth-token.entity'
import { User } from '../../common/entity/user.entity'
import { CustomHttpException } from '../../common/response/custom-http.exception'
import { ErrorCode } from '../../common/response/error-code.enum'

interface GoogleProfile {
  googleId: string
  email: string
  name: string
  picture: string
}

export interface JwtPayload {
  sub: number
  pid: string
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(AuthToken)
    private readonly authTokenRepository: Repository<AuthToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.googleClient = new OAuth2Client(
      configService.get('GOOGLE_CLIENT_ID'),
      configService.get('GOOGLE_CLIENT_SECRET'),
      'postmessage'
    )
  }

  private async exchangeGoogleCode(code: string): Promise<{ profile: GoogleProfile; idToken: string }> {
    try {
      const { tokens } = await this.googleClient.getToken(code)
      const idToken = tokens.id_token!
      const profile = await this.verifyGoogleIdToken(idToken)
      return { profile, idToken }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      if (err instanceof CustomHttpException) throw err
      throw new UnauthorizedException('Google authentication failed')
    }
  }

  private async verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get('GOOGLE_CLIENT_ID')
      })
      const payload = ticket.getPayload()
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token')
      }
      return {
        googleId: payload.sub,
        email: payload.email ?? '',
        name: payload.name ?? '',
        picture: payload.picture ?? ''
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      throw new UnauthorizedException('Google authentication failed')
    }
  }

  async googleLogin(code: string) {
    const { profile, idToken } = await this.exchangeGoogleCode(code)

    const authToken = await this.authTokenRepository.findOne({
      where: { providerType: 'google', providerUserId: profile.googleId },
      relations: ['user']
    })

    if (!authToken) {
      throw new CustomHttpException(
        HttpStatus.FORBIDDEN,
        ErrorCode.USER_NOT_REGISTERED,
        '가입되지 않은 회원입니다',
        { idToken }
      )
    }

    const user = authToken.user
    if (profile.email && user.email !== profile.email) user.email = profile.email
    if (profile.name && user.name !== profile.name) user.name = profile.name
    if (profile.picture && user.profileImage !== profile.picture) user.profileImage = profile.picture
    await this.userRepository.save(user)

    authToken.providerDataJson = { ...profile }
    authToken.refreshToken = this.generateRefreshToken()
    authToken.expiredAt = this.getRefreshExpiry()
    authToken.lastActivatedAt = new Date()
    await this.authTokenRepository.save(authToken)

    return {
      accessToken: this.jwtService.sign({ sub: user.id, pid: user.pid } as JwtPayload),
      refreshToken: authToken.refreshToken,
      user: this.toUserResponse(user)
    }
  }

  async register(idToken: string, marketingAgreed: boolean) {
    const profile = await this.verifyGoogleIdToken(idToken)

    // 이미 가입된 유저면 로그인 처리
    const existing = await this.authTokenRepository.findOne({
      where: { providerType: 'google', providerUserId: profile.googleId },
      relations: ['user']
    })
    if (existing) {
      existing.refreshToken = this.generateRefreshToken()
      existing.expiredAt = this.getRefreshExpiry()
      existing.lastActivatedAt = new Date()
      await this.authTokenRepository.save(existing)
      return {
        accessToken: this.jwtService.sign({ sub: existing.user.id, pid: existing.user.pid } as JwtPayload),
        refreshToken: existing.refreshToken,
        user: this.toUserResponse(existing.user)
      }
    }

    const user = this.userRepository.create({
      googleId: profile.googleId,
      email: profile.email,
      name: profile.name || '사용자',
      profileImage: profile.picture || null,
      role: 'child',
      marketingAgreedAt: marketingAgreed ? new Date() : null
    })
    await this.userRepository.save(user)

    const authToken = this.authTokenRepository.create({
      userId: user.id,
      providerType: 'google',
      providerUserId: profile.googleId,
      providerDataJson: { ...profile },
      refreshToken: this.generateRefreshToken(),
      expiredAt: this.getRefreshExpiry(),
      lastActivatedAt: new Date()
    })
    await this.authTokenRepository.save(authToken)

    return {
      accessToken: this.jwtService.sign({ sub: user.id, pid: user.pid } as JwtPayload),
      refreshToken: authToken.refreshToken,
      user: this.toUserResponse(user)
    }
  }

  async refresh(refreshToken: string) {
    const authToken = await this.authTokenRepository.findOne({
      where: { refreshToken },
      relations: ['user']
    })

    if (!authToken) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, '유효하지 않은 리프레시 토큰입니다')
    }

    if (authToken.expiredAt && authToken.expiredAt < new Date()) {
      throw new CustomHttpException(HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED, '만료된 리프레시 토큰입니다')
    }

    const user = authToken.user
    authToken.refreshToken = this.generateRefreshToken()
    authToken.expiredAt = this.getRefreshExpiry()
    authToken.lastActivatedAt = new Date()
    await this.authTokenRepository.save(authToken)

    return {
      accessToken: this.jwtService.sign({ sub: user.id, pid: user.pid } as JwtPayload),
      refreshToken: authToken.refreshToken
    }
  }

  async getMe(payload: JwtPayload) {
    const user = await this.userRepository.findOneBy({ id: payload.sub })
    if (!user) throw new UnauthorizedException()
    return this.toUserResponse(user)
  }

  private toUserResponse(user: User) {
    return {
      pid: user.pid,
      email: user.email,
      name: user.name,
      profileImage: user.profileImage,
      role: user.role
    }
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('hex')
  }

  private getRefreshExpiry(): Date {
    const expiry = new Date()
    expiry.setDate(expiry.getDate() + 30)
    return expiry
  }
}
