import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import chokidar from 'chokidar'

// let current: ChildProcess | null = null
// chokidar.watch('./assets', { ignoreInitial: true }).on('all', (e) => {
// 	if (e === 'add') {
// 		if (current)current.kill()
// 		current = spawn('npx tsx ./scripts/generateAssetNames.ts', {
// 			stdio: 'inherit',
// 			shell: true,
// 		})
// 	}
// })
