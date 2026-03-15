const { execSync } = require('child_process')
const { writeFileSync } = require('fs')
let v = 'unknown'
try { v = execSync('git describe --tags --always', { encoding: 'utf-8' }).trim().replace(/^v/, '') } catch {}
const ts = new Date().toISOString().replace(/[-T:]/g, '').slice(4, 12)
writeFileSync('build-version.json', JSON.stringify({ version: `${v}(${ts})` }))
