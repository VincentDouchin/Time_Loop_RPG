import path from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import watchAssets from './scripts/generateAssetNamesPlugin'

// https://vitejs.dev/config/
export default defineConfig(() => {
	const config: UserConfig = {
		plugins: [
			VitePWA({
				registerType: 'autoUpdate',
				injectRegister: 'auto',
				devOptions: {
					enabled: true,
				},
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
							src: 'pwa-64x64.png',
							sizes: '64x64',
							type: 'image/png',
						},
						{
							src: 'pwa-192x192.png',
							sizes: '192x192',
							type: 'image/png',
						},
						{
							src: 'pwa-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any',
						},
						{
							src: 'maskable-icon-512x512.png',
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable',
						},
					],
				},
			}),
			watchAssets(),
		],
		base: '/',

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
