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
			manifest: {
				start_url: 'index.html?fullscreen=true',
				display: 'fullscreen',
				orientation: 'landscape',
				name: 'Hell\'s Tea Shop',
				short_name: 'Hell\'s Tea Shop',
				description: 'Hell\'s Tea Shop',
				theme_color: '#000000',
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
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
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
				{ find: '@assets', replacement: path.resolve(__dirname, './assets') },

			],
		},

	}

	return config
})
