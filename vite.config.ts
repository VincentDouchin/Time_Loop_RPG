import path from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(() => {
	const config: UserConfig = {
		server: {
			watch: {
				ignored: /assets/,
			},
		},
		base: '',

		build: {
			target: 'esnext',

		},
		resolve: {
			alias: [
				{ find: '@', replacement: path.resolve(__dirname, './src') },

			],
		},

	}

	return config
})
