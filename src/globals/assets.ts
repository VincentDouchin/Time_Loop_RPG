import { AssetLoader, addAnimationsData, createAtlas, getCharacterName, getFileName, getFolderName, joinAtlas, loadImage } from '../utils/assetLoader'
import type { LDTKMap } from '@/level/LDTK'
import { getBuffer } from '@/utils/buffer'
import { asyncMapValues, entries, groupByObject, mapKeys, mapValues, reduce } from '@/utils/mapFunctions'

const imagesLoader = new AssetLoader()
	.pipe(async (glob) => {
		return asyncMapValues(mapKeys(glob, getFileName), m => loadImage(m.default))
	})

const levelLoader = new AssetLoader<LDTKMap>()
	.pipe(glob => mapKeys(glob, getFileName))
const characterLoader = new AssetLoader()
	.pipe(async (glob) => {
		const img = await asyncMapValues(glob, m => loadImage(m.default))
		const textures = await asyncMapValues(img, m => createAtlas(m, 32))
		const characters = groupByObject(textures, getCharacterName)
		const atlas = mapValues(characters, c => reduce(c, joinAtlas))
		return mapValues(atlas, addAnimationsData)
	})
const uiLoader = new AssetLoader()
	.pipe(async (glob) => {
		const ui = await asyncMapValues(glob, async (m) => {
			const img = await loadImage(m.default)
			return {
				path: m.default,
				width: img.width,
				height: img.height,
			}
		})
		return mapKeys(ui, getFileName)
	})

const fontLoader = new AssetLoader()
	.pipe(async (glob) => {
		const fonts = mapKeys(glob, getFileName)
		for (const [key, m] of entries(fonts)) {
			const font = new FontFace(key, `url(${m.default})`)
			await font.load()
			document.fonts.add(font)
		}
	})
const mergeImages = (images: Record<string, HTMLImageElement>) => {
	const img = entries(images)
		.sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
		.map(([_, i]) => i)
	const buffer = getBuffer(img[0].width, img[0].height)
	for (const i of img) {
		buffer.drawImage(i, 0, 0, i.width, i.height)
	}
	return buffer.canvas
}
const animateSpritesLoader = new AssetLoader()
	.pipe(async (glob) => {
		const img = await asyncMapValues(glob, m => loadImage(m.default))
		const items = groupByObject(img, getFolderName)
		const merged = mapValues(items, mergeImages)
		return mapValues(merged, t => createAtlas(t)[0])
	})
const animationsLoader = new AssetLoader()
	.pipe(async (glob) => {
		const img = await asyncMapValues(glob, m => loadImage(m.default))
		const anim = mapKeys(img, getFileName)
		return mapValues(anim, t => createAtlas(t)[0])
	})
export const loadAssets = async () => {
	const levels = await levelLoader.loadAsync<levels>(import.meta.glob('./../../assets/levels/*.json', { eager: true }))
	const tilesets = await imagesLoader.loadAsync<tilesets>(import.meta.glob('./../../assets/tilesets/*.png', { eager: true }))
	const characters = await characterLoader.loadAsync<characters>(import.meta.glob('./../../assets/characters/**/*[!Shadows].png', { eager: true }))
	const ui = await uiLoader.loadAsync<ui>(import.meta.glob('./../../assets/ui/*.png', { eager: true }))
	const fonts = await fontLoader.loadAsync<fonts>(import.meta.glob('./../../assets/fonts/*.*', { eager: true }))
	const animatedTextures = await animateSpritesLoader.loadAsync<items>(import.meta.glob('./../../assets/items/**/*.png', { eager: true }))
	const animations = await animationsLoader.loadAsync<animations>(import.meta.glob('./../../assets/animations/*.png', { eager: true }))
	const staticItems = await imagesLoader.loadAsync<staticItems>(import.meta.glob('./../../assets/staticItems/*.png', { eager: true }))
	return { levels, tilesets, characters, ui, fonts, animatedTextures, animations, staticItems } as const
}
