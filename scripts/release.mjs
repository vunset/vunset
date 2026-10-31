// Publishes every package in dependency order; a prerelease goes to `next`
// (npm ignores publishConfig.tag). Extra args pass through: --dry-run, --otp=…
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync('packages/vue/package.json', 'utf8'))
const tag = version.includes('-') ? 'next' : 'latest'
for (const name of ['utils', 'vue', 'ui', 'nuxt'])
  execFileSync('npm', ['publish', '-w', `@vunset/${name}`, '--tag', tag, ...process.argv.slice(2)], { stdio: 'inherit' })
