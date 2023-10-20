import { assets } from '@/globals/init'

interface item {
	key: boolean
	sprite: OffscreenCanvas | HTMLCanvasElement
}

export const items = {
	LumberjackAxe: {
		key: true,
		sprite: assets.weapons.axeoakiron,
	},
	Beer: {
		key: true,
		sprite: assets.ui.beer,
	},
} as const satisfies Record<string, item>
