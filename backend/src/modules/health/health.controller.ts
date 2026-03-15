import { Controller, Get } from '@nestjs/common'
import { execSync } from 'child_process'
import { readFileSync } from 'fs'
import { join } from 'path'

function loadVersion(): string {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), 'build-version.json'), 'utf-8')).version
  } catch {}
  // dev fallback
  let v = 'unknown'
  try { v = execSync('git describe --tags --always', { encoding: 'utf-8' }).trim().replace(/^v/, '') } catch {}
  const ts = new Date().toISOString().replace(/[-T:]/g, '').slice(4, 12)
  return `${v}(${ts})`
}

const version = loadVersion()

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', version }
  }
}
