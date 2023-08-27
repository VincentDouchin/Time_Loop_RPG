import { getBuffer } from './buffer'

type chainFn<T = any> = (value: T, key: string, name: string) => any

export class AssetLoaderChain<R = { default: string }> {
	chains: Array<chainFn> = []
	constructor(private keyTransform: (key: string) => string) {
	}

	chain<F extends chainFn<R>>(fn: F) {
		this.chains.push(fn)
		return this as AssetLoaderChain<Awaited<ReturnType<F>>>
	}

	async load<K extends string>(glob: Record<string, any>) {
		const finalResult: any = {}
		for (const [key, val] of Object.entries(glob)) {
			let result = val
			const name = this.keyTransform(key)
			for (const chain of this.chains) {
				result = await chain(result, key, name)
			}
			finalResult[name] = result
		}
		return finalResult as Record<K, R>
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

export const getFileName = (path: string) => path.split(/[./]/g).at(-2) ?? ''

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
