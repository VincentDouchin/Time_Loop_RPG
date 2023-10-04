import path from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import watchAssets from './scripts/generateAssetNamesPlugin'

// https://vitejs.dev/config/
export default defineConfig(() => {
	const config: UserConfig = {
		plugins: [watchAssets()],
		base: '',

		build: {
			target: 'esnext',

		},
		esbuild: {
			jsxFactory: 'createUiEntity',
			jsx: 'transform',
			jsxInject: 'import { createUiEntity } from \"@/utils/JSXEntity\"',

		},
		resolve: {
			alias: [
				{ find: '@', replacement: path.resolve(__dirname, './src') },

			],
		},

	}

	return config
})
