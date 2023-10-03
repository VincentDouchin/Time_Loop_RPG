import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import type { PluginOption } from 'vite'

export default function watchAssets(): PluginOption {
	let current: ChildProcess | null = null
	const launchScript = (path: string) => {
		if (path.includes('assets\\') && path.split('.').at(-1) === 'png') {
			if (current) return
			console.log('regenerating asset names', path)
			current = spawn('npx tsx ./scripts/generateAssetNames.ts', {
				stdio: 'inherit',
				shell: true,
			})
			current.on('close', () => {
				current = null
			})
		}
	}
	return {
		name: 'watch-assets',
		configureServer(server) {
			server.watcher.on('add', launchScript)
			server.watcher.on('unlink', launchScript)
		},

	}
}
