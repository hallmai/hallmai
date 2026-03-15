import { Controller, Get } from '@nestjs/common'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadVersion(): string {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'build-version.json'), 'utf-8')).version
  } catch {}
  return 'unknown'
}

const version = loadVersion()

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', version }
  }
}
