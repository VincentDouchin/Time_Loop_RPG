import { AssetLoader, addAnimationsData, createAtlas, getCharacterName, getFileName, getFolderName, joinAtlas, loadImage, splitAtlas } from '../utils/assetLoader'
import { inputs } from './inputsIcons'
import type { LDTKMap } from '@/level/LDTK'
import { PixelTexture } from '@/lib/pixelTexture'
import { getOffscreenBuffer, getScreenBuffer } from '@/utils/buffer'
import { addKeys, asyncMapValues, entries, groupByObject, mapKeys, mapValues, range, reduce } from '@/utils/mapFunctions'

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
			const buffer = getScreenBuffer(img.width, img.height)
			buffer.drawImage(img, 0, 0)
			return buffer.canvas
		})
		return mapKeys(ui, getFileName)
	})
const uiAtlasLoader = new AssetLoader()
	.pipe(async (glob) => {
		const images = await asyncMapValues(glob, m => loadImage(m.default))
		const atlases = mapValues(images, splitAtlas)
		return mapKeys(atlases, getFileName)
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
						const buffer = getOffscreenBuffer(24, h)
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
							const buffer = getOffscreenBuffer(8, 8)
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
			const [name, weight] = key.split('-')
			const font = new FontFace(name, `url(${m.default})`, { weight: weight ?? 'normal' })
			await font.load()
			document.fonts.add(font)
		}
	})
const mergeImages = (images: Record<string, HTMLImageElement>) => {
	const img = entries(images)
		.sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
		.map(([_, i]) => i)
	const buffer = getOffscreenBuffer(img[0].width, img[0].height)
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
const inputsLoader = async (glob: Record<string, { default: string }>) => {
	const img = await loadImage(Object.values(glob)[0].default)
	return await inputs(img)
}
const heroIconsNames = [
	['bard', 'attack1', 'attack2', 'attack3', 'attack4'],
	['cleric', 'attack1', 'attack2', 'attack3', 'attack4'],
	['paladin', 'paladinAttack1', 'paladinAttack2', 'paladinAttack3', 'paladinAttack4'],
] as const
const heroIconsLoader = new AssetLoader()
	.pipe(async (glob) => {
		const res: Record<string, HTMLCanvasElement> = {}
		const img = await loadImage(Object.values(glob)[0].default)
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 5; x++) {
				const buffer = getScreenBuffer(8, 8)
				buffer.drawImage(img, x * 16 + 8, y * 16 + 8, 8, 8, 0, 0, 8, 8)
				res[heroIconsNames[y][x]] = buffer.canvas
			}
		}
		return res
	})
const portalSize = ['big2', 'big1', 'medium', 'small', 'tiny'] as const
const portalLoader = async (glob: Record<string, { default: string }>) => {
	const images = await asyncMapValues(glob, m => loadImage(m.default))
	const split = groupByObject(images, getFolderName)

	const portalImages = range(0, portalSize.length, (i) => {
		const buffer = getOffscreenBuffer(48, 48)
		for (const img of Object.values(split.portal)) {
			buffer.drawImage(img, 0, i * 48, 48, 48, 0, 0, 48, 48)
		}
		return buffer.canvas
	})
	const sizes = addKeys(portalSize, portalImages)
	const animationsWithoutNames = mapValues(split.animations, (img) => {
		const atlases = range(0, 3, (i) => {
			const buffer = getOffscreenBuffer(img.width, 48)
			buffer.drawImage(img, 0, i * 48, img.width, 48, 0, 0, img.width, 48)
			return splitAtlas(buffer.canvas).map(x => new PixelTexture(x))
		})
		return addKeys(['start', 'middle', 'end'] as const, atlases)
	})
	const animations = mapKeys(animationsWithoutNames, (key) => {
		const size = portalSize.find(s => key.includes(s))
		if (size) {
			return size
		} else {
			return 'globe' as const
		}
	})

	return { sizes, animations }
}
export const loadAssets = async () => {
	const levels = await levelLoader.loadRecord<levels>(import.meta.glob('./../../assets/levels/*.json', { eager: true }))
	const tilesets = await imagesLoader.loadRecord<tilesets>(import.meta.glob('./../../assets/tilesets/*.png', { eager: true }))
	const characters = await characterLoader.loadRecord<characters>(import.meta.glob('./../../assets/characters/**/*.png', { eager: true }))
	const ui = await uiLoader.loadRecord<ui>(import.meta.glob('./../../assets/ui/*.png', { eager: true }))
	const uiAtlas = await uiAtlasLoader.loadRecord<uiAtlas>(import.meta.glob('./../../assets/uiAtlas/*.png', { eager: true }))
	const fonts = await fontLoader.loadRecord<fonts>(import.meta.glob('./../../assets/fonts/*.*', { eager: true }))
	const animatedTextures = await animateSpritesLoader.loadRecord<items>(import.meta.glob('./../../assets/items/**/*.png', { eager: true }))
	const animations = await animationsLoader.loadRecord<animations>(import.meta.glob('./../../assets/animations/*.png', { eager: true }))
	const staticItems = await imagesLoader.loadRecord<staticItems>(import.meta.glob('./../../assets/staticItems/*.png', { eager: true }))
	const chests = await chestLoader.loadRecord<chests>(import.meta.glob('./../../assets/_singles/Chests.png', { eager: true }))
	const weapons = await weaponsLoader.loadRecord<weapons>(import.meta.glob('./../../assets/_singles/Minifantasy_CraftingAndProfessionsWeaponIcons.png', { eager: true }))
	const inputs = await inputsLoader(import.meta.glob('./../../assets/_singles/tilemap_packed.png', { eager: true }))
	const heroIcons = await heroIconsLoader.loadRecord<typeof heroIconsNames[number][number]>(import.meta.glob('./../../assets/_singles/TrueHeroes2Icons.png', { eager: true }))
	const portals = await portalLoader(import.meta.glob('./../../assets/_singles/portal/**', { eager: true }))
	return {
		levels,
		tilesets,
		characters,
		ui,
		uiAtlas,
		fonts,
		animatedTextures,
		animations,
		staticItems,
		chests,
		weapons,
		inputs,
		heroIcons,
		portals,
	}
}
