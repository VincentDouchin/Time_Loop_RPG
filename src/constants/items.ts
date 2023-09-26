import { assets } from '@/globals/init'
import type { PixelTexture } from '@/lib/pixelTexture'

interface item {
	key: boolean
	treasure?: boolean
	sprite: PixelTexture
}

export const items = {
	lumberjackAxe: {
		key: true,
		treasure: true,
		sprite: assets.weapons.axeoakiron,
	},
} as const satisfies Record<string, item>
