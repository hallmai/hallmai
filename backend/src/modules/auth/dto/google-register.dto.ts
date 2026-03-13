import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class GoogleRegisterDto {
  @IsString()
  @IsNotEmpty()
  registrationToken: string

  @IsBoolean()
  marketingAgreed: boolean
}
