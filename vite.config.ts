import path from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import watchAssets from './scripts/generateAssetNamesPlugin'

// https://vitejs.dev/config/
export default defineConfig(() => {
	const config: UserConfig = {
		plugins: [watchAssets(), VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
			manifest: {
				name: 'My Awesome App',
				short_name: 'MyApp',
				description: 'My Awesome App description',
				theme_color: '#ffffff',
				icons: [
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
					},
				],
			},
		})],
		base: '',

		build: {
			target: 'esnext',

		},
		esbuild: {
			jsxFactory: 'createUiEntity',
			jsx: 'transform',
			jsxInject: 'import { createUiEntity } from \"@/ui/JSXEntity\"',

		},
		resolve: {
			alias: [
				{ find: '@', replacement: path.resolve(__dirname, './src') },

			],
		},

	}

	return config
})
