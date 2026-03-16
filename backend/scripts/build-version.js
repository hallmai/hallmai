const { writeFileSync } = require('fs')
const ts = new Date().toISOString().replace(/[-T:]/g, '').slice(4, 12)
writeFileSync('build-version.json', JSON.stringify({ version: ts }))
