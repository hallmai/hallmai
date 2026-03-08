import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common'
import { AuthService, JwtPayload } from './auth.service'
import { CurrentUser } from './current-user.decorator'
import { GoogleLoginDto } from './dto/google-login.dto'
import { GoogleRegisterDto } from './dto/google-register.dto'
import { RefreshDto } from './dto/refresh.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() dto: GoogleLoginDto) {
    return this.authService.googleLogin(dto.code)
  }

  @Post('google/register')
  async register(@Body() dto: GoogleRegisterDto) {
    return this.authService.register(dto.idToken, dto.marketingAgreed)
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: JwtPayload) {
    return this.authService.getMe(user)
  }
}
