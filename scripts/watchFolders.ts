import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import chokidar from 'chokidar'

let current: ChildProcess | null = null
chokidar.watch('./assets', { persistent: true }).on('all', () => {
	if (current)current.kill()
	current = spawn('npx tsx ./scripts/generateAssetNames.ts', {
		stdio: 'inherit',
		shell: true,
	})
})
