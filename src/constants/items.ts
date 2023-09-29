import { assets } from '@/globals/init'

interface item {
	key: boolean
	treasure?: boolean
	sprite: OffscreenCanvas
}

export const items = {
	LumberjackAxe: {
		key: true,
		treasure: true,
		sprite: assets.weapons.axeoakiron,
	},
} as const satisfies Record<string, item>
