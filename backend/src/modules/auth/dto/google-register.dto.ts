import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class GoogleRegisterDto {
  @IsString()
  @IsNotEmpty()
  idToken: string

  @IsBoolean()
  marketingAgreed: boolean
}
