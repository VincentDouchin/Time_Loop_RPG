import { getOffscreenBuffer } from './buffer'
import { Sprite } from '@/lib/sprite'
import { PixelTexture } from '@/lib/pixelTexture'

export const createDebugtexture = (w: number, h: number, color?: string) => {
	const b = getOffscreenBuffer(w, h)
	b.fillStyle = color ?? `#${Math.floor(Math.random() * 16777215).toString(16)}`
	b.fillRect(0, 0, w, h)
	return new Sprite(new PixelTexture(b.canvas))
}
