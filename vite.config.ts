import path from 'node:path'
import type { UserConfig } from 'vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import watchAssets from './scripts/generateAssetNamesPlugin'

export default defineConfig(() => {
	const config: UserConfig = {
		plugins: [
			watchAssets(),
			 VitePWA({
				registerType: 'autoUpdate',
				devOptions: {
					enabled: true,
				},
				includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
				manifest: {
					start_url: 'index.html?fullscreen=true',
					display: 'fullscreen',
					orientation: 'landscape',
					name: 'Time Loop RPG',
					short_name: 'TimeLoopRPG',
					description: 'Time Loop RPG',
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
			}),
		],
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
