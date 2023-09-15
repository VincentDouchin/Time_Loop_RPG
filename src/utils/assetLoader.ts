import { getBuffer } from './buffer'

import type { characterNames } from '@/constants/animations'
import { animations } from '@/constants/animations'
import { PixelTexture } from '@/lib/pixelTexture'
import type { TextureAltasStates } from '@/lib/sprite'

type pipeFn<T> = (glob: Record<string, T>) => Promise<Record<string, any>> | Record<string, any>

export class AssetLoader< T = { default: string } > {
	#fn: pipeFn<T> = x => x
	constructor() {}
	pipe<F extends pipeFn<T>>(fn: F) {
		this.#fn = fn
		return this as AssetLoader<Awaited<ReturnType<F>>>
	}

	async loadAsync<K extends string>(glob: Record<string, T>) {
		return await this.#fn(glob) as Promise<Record< K, T[keyof T]>>
	}
}

export const loadImage = (path: string): Promise<HTMLImageElement> => new Promise((resolve) => {
	const img = new Image()
	img.src = path
	img.onload = () => resolve(img)
})

export const getFileName = (path: string) => {
	return	path.split(/[./]/g).at(-2) ?? ''
}
export const getFolderName = (path: string) => {
	return	path.split(/[./]/g).at(-3) ?? ''
}
export const getAnimationName = (path: string) => {
	const parts = getFileName(path).split(/(?=[A-Z])/).map(s => s.toLowerCase())
	parts.shift()
	return parts.join('')
}
export const getCharacterName = (path: string) => getFolderName(path).replace('_', '') as characterNames

export const splitTexture = (tiles: number) => (img: HTMLImageElement) => {
	const result: HTMLCanvasElement[] = []
	const width = img.width / tiles
	const height = img.height
	for (let i = 0; i < tiles; i++) {
		const buffer = getBuffer(width, img.height)
		buffer.drawImage(img, width * i, 0, width, height, 0, 0, width, height)
		result.push(buffer.canvas)
	}
	return result
}

export const createAtlas = (img: HTMLImageElement, dimension: number) => {
	const result: Array<Array<PixelTexture>> = []
	const spriteNb = img.width / dimension
	for (let y = 0; y < img.height / dimension; y++) {
		result[y] = []
		for (let x = 0; x < spriteNb; x++) {
			const buffer = getBuffer(dimension, dimension)
			buffer.drawImage(
				img,
				x * dimension, y * dimension, dimension, dimension,
				0, 0, dimension, dimension,
			)
			result[y].push(new PixelTexture(buffer.canvas))
		}
	}
	return result
}

export const joinAtlas = (path: string, atlas: PixelTexture[][]) => {
	const key = getAnimationName(path)
	if (atlas.length === 1) {
		return { [key]: atlas[0] }
	} else {
		return {
			[`${key}-right-down`]: atlas[0],
			[`${key}-left-down`]: atlas[1],
			[`${key}-right-up`]: atlas[2],
			[`${key}-left-up`]: atlas[3],
		}
	}
}
export const addAnimationsData = (atlas: Record<string, PixelTexture[]>, key: characterNames): TextureAltasStates<any> => {
	return {
		speed: animations[key]?.speed ?? animations.default.speed,
		states: atlas,
	}
}
