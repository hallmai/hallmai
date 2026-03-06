import { Type } from 'class-transformer'
import { IsOptional, IsPositive, Min } from 'class-validator'

export class BaseListDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive()
  current: number = 1

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize: number = 10

  get skip(): number {
    return (this.current - 1) * this.pageSize
  }
}
