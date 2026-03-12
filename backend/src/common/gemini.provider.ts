import { GoogleGenAI } from '@google/genai'
import { ConfigService } from '@nestjs/config'

export const GEMINI_CLIENT = 'GEMINI_CLIENT'

export const GeminiProvider = {
  provide: GEMINI_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): GoogleGenAI =>
    new GoogleGenAI({ apiKey: config.get<string>('GEMINI_API_KEY')! })
}
