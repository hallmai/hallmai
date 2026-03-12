import { Global, Module } from '@nestjs/common'
import { GeminiProvider } from './gemini.provider'

@Global()
@Module({
  providers: [GeminiProvider],
  exports: [GeminiProvider]
})
export class GeminiModule {}
