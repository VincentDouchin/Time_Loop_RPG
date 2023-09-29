import { AssetLoader, addAnimationsData, createAtlas, getCharacterName, getFileName, getFolderName, joinAtlas, loadImage } from '../utils/assetLoader'
import type { LDTKMap } from '@/level/LDTK'
import { PixelTexture } from '@/lib/pixelTexture'
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
				texture: new PixelTexture(img),
				path: m.default,
				width: img.width,
				height: img.height,
			}
		})
		return mapKeys(ui, getFileName)
	})
type chestColor = 'wood' | 'red' | 'azure' | 'green' | 'purple' | 'white' | 'grey' | 'cyan'
type chestsStates = 'ChestClosed' | 'ChestOpen' | 'Key'
export type chests = `${chestColor}${chestsStates}${1 | 2 | 4 | 5 | 6}`
const chestLoader = new AssetLoader()
	.pipe(async (glob) => {
		const image = await loadImage(Object.values(glob)[0].default)
		const result: Record<string, PixelTexture> = {}
		const chests = [['wood', 'red', 'azure', 'green'], ['purple', 'white', 'grey', 'cyan']]
		const names = ['ChestClosed', 'ChestOpen', 'Key']
		for (let rowIndex = 0; rowIndex < chests.length; rowIndex++) {
			const row = chests[rowIndex]
			for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
				const color = row[columnIndex]
				const yOffset = rowIndex * 8 * 16
				const xOffset = columnIndex * 3 * 24
				for (let x = 0; x < 3; x++) {
					for (let y = 0; y < 7; y++) {
						const h = y === 6 ? 32 : 16
						const buffer = getBuffer(24, h)
						buffer.drawImage(image, xOffset + x * 24, yOffset + y * 16 + (rowIndex === 1 ? 16 : 0) + (y === 6 ? 16 : 0), 24, h, 0, 0, 24, h)
						result[color + names[x] + y] = new PixelTexture(buffer.canvas)
					}
				}
			}
		}
		return result
	})

const weaponNames = ['dagger', 'sword', 'axe', 'flail', 'longsword', 'crossbow', 'hammer', 'pickaxe', 'bow'] as const
const staves = ['pine', 'yellow', 'rose', 'oak', 'birch'] as const
const metals = ['iron', 'steel', 'bronze', 'silver', 'gold'] as const
const gems = ['', null, 'purple', 'white', 'green', 'red', 'orange'] as const
type weapons = `${typeof weaponNames[number]}${typeof staves[number]}${typeof metals[number]}${NonNullable<typeof gems[number]>}`
export const weaponsLoader = new AssetLoader()
	.pipe(async (glob) => {
		const image = await loadImage(Object.values(glob)[0].default)
		const result = {} as Record<weapons, OffscreenCanvas>
		const initialXOffset = 16
		const initialYOffset = 16
		weaponNames.forEach((weapon, wi) => {
			staves.forEach((staff, si) => {
				metals.forEach((metal, mi) => {
					gems.forEach((gem, gi) => {
						if (gem !== null) {
							const buffer = getBuffer(8, 8)
							const xOffset = initialXOffset + 32 + wi * 11 * 8 + gi * 8
							const yOffset = initialYOffset + 8 + si * 6 * 8 + mi * 8
							buffer.drawImage(image, xOffset, yOffset, 8, 8, 0, 0, 8, 8)
							const name: weapons = `${weapon}${staff}${metal}${gem}`
							result[name] = buffer.canvas
						}
					})
				})
			})
		})
		return result
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
	const chests = await chestLoader.loadAsync<chests>(import.meta.glob('./../../assets/_singles/Chests.png', { eager: true }))
	const weapons = await weaponsLoader.loadAsync<weapons>(import.meta.glob('./../../assets/_singles/Minifantasy_CraftingAndProfessionsWeaponIcons.png', { eager: true }))

	return { levels, tilesets, characters, ui, fonts, animatedTextures, animations, staticItems, chests, weapons } as const
}
