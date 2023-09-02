import { AssetLoaderChain, createAtlas, getFileName, loadImage } from '../utils/assetLoader'
import type { characterStates } from '@/character/spawnOverworldCharacter'
import { animations } from '@/constants/animations'
import type { LDTKMap } from '@/level/LDTK'

const levelLoader = new AssetLoaderChain<LDTKMap>(getFileName)

const spriteLoader = new AssetLoaderChain(getFileName)
	.chain(async (m) => {
		const img = await loadImage(m.default)
		return {
			path: m.default,
			width: img.width,
			height: img.height,
		}
	})

const tileSetLoader = new AssetLoaderChain(getFileName)
	.chain((m, _) => loadImage(m.default))

const characterLoader = new AssetLoaderChain(getFileName)
	.chain(m => loadImage(m.default))
	.chain((img, _, k) => createAtlas(img, animations[k as characters], 32, 32))

export const assets = {
	levels: await levelLoader.load<levels>(import.meta.glob('./../../assets/levels/*.json', { eager: true })),
	tilesets: await tileSetLoader.load<tilesets>(import.meta.glob('./../../assets/levels/tilesets/*.png', { eager: true })),
	characters: await characterLoader.load<characters>(import.meta.glob('./../../assets/characters/*.png', { eager: true })),
	ui: await spriteLoader.load<ui>(import.meta.glob('./../../assets/ui/*.png', { eager: true })),
}
