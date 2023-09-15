import { AssetLoader, addAnimationsData, createAtlas, getCharacterName, getFileName, joinAtlas, loadImage } from '../utils/assetLoader'
import { type characterNames } from '@/constants/animations'
import type { LDTKMap } from '@/level/LDTK'
import { asyncMapValues, entries, groupByObject, mapKeys, mapValues, reduce } from '@/utils/mapFunctions'

const tileSetLoader = new AssetLoader()
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

export const assets = {
	levels: await levelLoader.loadAsync<levels>(import.meta.glob('./../../assets/levels/*.json', { eager: true })),
	tilesets: await tileSetLoader.loadAsync<tilesets>(import.meta.glob('./../../assets/levels/tilesets/*.png', { eager: true })),
	characters: await characterLoader.loadAsync<characterNames>(import.meta.glob('./../../assets/characters/**/*[!Shadows].png', { eager: true })),
	ui: await uiLoader.loadAsync<ui>(import.meta.glob('./../../assets/ui/*.png', { eager: true })),
	fonts: await fontLoader.loadAsync<fonts>(import.meta.glob('./../../assets/fonts/*.*', { eager: true })),
}
