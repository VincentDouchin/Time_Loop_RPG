import { getBuffer } from './buffer'
import { Sprite } from '@/lib/sprite'
import { PixelTexture } from '@/lib/pixelTexture'

export const createDebugtexture = (w: number, h: number, color: string = 'red') => {
	const b = getBuffer(w, h)
	b.fillStyle = color
	b.fillRect(0, 0, w, h)
	return new Sprite(new PixelTexture(b.canvas))
}
