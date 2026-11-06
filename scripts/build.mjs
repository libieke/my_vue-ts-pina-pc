import { spawnSync } from 'node:child_process'
import { mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tempDir = join(root, '.tmp')

mkdirSync(tempDir, { recursive: true })

const env = {
  ...process.env,
  TEMP: tempDir,
  TMP: tempDir,
  TMPDIR: tempDir,
}

function cleanup() {
  try {
    rmSync(tempDir, { recursive: true, force: true })
  } catch {
  }
}

function run(binPath, args) {
  const result = spawnSync(process.execPath, [join(root, 'node_modules', binPath), ...args], {
    cwd: root,
    env,
    stdio: 'inherit',
  })

  if (result.error) {
    console.error(result.error)
    cleanup()
    process.exit(1)
  }

  if (result.status !== 0) {
    cleanup()
    process.exit(result.status ?? 1)
  }
}

run(join('vue-tsc', 'bin', 'vue-tsc.js'), ['-b'])
run(join('vite', 'bin', 'vite.js'), ['build'])

cleanup()
