import { getBuffer } from './buffer'
import type { TextureAltasStates } from '@/lib/sprite'

import { PixelTexture } from '@/lib/pixelTexture'
import type { animations, characterNames } from '@/constants/animations'

type chainFn<T = any> = (value: T, key: string, name: string) => any
type reduceFn<T = any> = (value: Record<string, T>) => any
export class AssetLoaderChain<R = { default: string }> {
	chains: Array<chainFn> = []
	#reduce: (arg: Record<string, R>) => unknown = x => x
	constructor(private keyTransform: (key: string) => string) {
	}

	chain<F extends chainFn<R>>(fn: F) {
		this.chains.push(fn)
		return this as AssetLoaderChain<Awaited<ReturnType<F>>>
	}

	reduce< F extends reduceFn<R>>(fn: F) {
		this.#reduce = fn
		return this as AssetLoaderChain<ReturnType<F>[number]>
	}

	async load<K extends string>(glob: Record<string, any>) {
		const finalResult = {} as Record<K, R>
		for (const [key, val] of Object.entries(glob)) {
			let result = val
			const name = this.keyTransform(key) as K
			for (const chain of this.chains) {
				result = await chain(result, key, name)
			}
			finalResult[name] = result
		}
		return this.#reduce(finalResult) as Record<K, R>
	}

	clone() {
		const newChain = new AssetLoaderChain(this.keyTransform)
		newChain.chains = [...this.chains]
		return newChain
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
	const result: Array<Array<CanvasRenderingContext2D>> = []
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
			result[y].push(buffer)
		}
	}
	return result
}
export const joinAtlas = <K extends string>(atlas: Record<string, Array<Array<CanvasRenderingContext2D>>>, animationData: typeof animations) => {
	const result: Record<string, Record<string, { normal: CanvasRenderingContext2D[]; shadow: CanvasRenderingContext2D[] }>> = {}
	for (const [key, images] of Object.entries(atlas)) {
		const parts = key.split(/(?=[A-Z])/).map(s => s.toLowerCase())
		const character = parts[0]
		const animation = parts.filter(key => key !== character && key !== 'shadow').join('')
		const shadow = parts.at(-1) === 'shadow'
		const directions = images.length === 4 ? ['right-down', 'left-down', 'right-up', 'left-up'] : ['']
		for (let i = 0; i < directions.length; i++) {
			const direction = directions[i]
			const animationName = direction ? `${animation}-${direction}` : animation
			if (!result[character]) {
				result[character] = {}
			}
			if (!result[character][animationName]) {
				result[character][animationName] = { normal: [], shadow: [] }
			}
			result[character][animationName][shadow ? 'shadow' : 'normal'] = images[i]
		}
	}
	const finalResult: Record<string, TextureAltasStates<K>> = { }
	for (const [character, animations] of Object.entries(result)) {
		if (!finalResult[character]) {
			finalResult[character] = { states: {}, speed: animationData[character as characterNames].speed } as TextureAltasStates<K>
		}
		for (const [animationName, textures] of Object.entries(animations)) {
			const finalTextures: PixelTexture[] = []
			for (let i = 0; i < textures.normal?.length; i++) {
				textures.shadow[i].drawImage(textures.normal[i].canvas, 0, 0)
				finalTextures.push(new PixelTexture(textures.shadow[i].canvas))
			}
			finalResult[character].states[animationName as K] = finalTextures
		}
	}

	return finalResult
}
