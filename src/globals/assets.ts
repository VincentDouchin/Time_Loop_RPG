import { AssetLoaderChain, createAtlas, getFileName, loadImage } from '../utils/assetLoader'
import type { characterStates } from '@/character/spawnOverworldCharacter'
import type { LDTKMap } from '@/level/LDTK'

const levelLoader = new AssetLoaderChain<LDTKMap>(getFileName)

// const spriteLoader = new AssetLoaderChain(getFileName)
// 	.chain((m, _) => loadImage(m.default))
// 	.chain((v, _) => new PixelTexture(v))

// const textureAtlasLoader = new AssetLoaderChain(getFileName)
// 	.chain(m => loadImage(m.default))
// 	.chain((img, _, k) => {
// 		return splitTexture(6)(img)
// 	})
// 	.chain(atlas => atlas.map(canvas => new PixelTexture(canvas)))

const tileSetLoader = new AssetLoaderChain(getFileName)
	.chain((m, _) => loadImage(m.default))

const characterLoader = new AssetLoaderChain(getFileName)
	.chain(m => loadImage(m.default))
	.chain(img => createAtlas<characterStates>(img, [['idle', 4], ['run', 6], ['hit', 3], ['jump', 6], ['death', 6], ['attack', 6]], 32, 32))

export const assets = {
	levels: await levelLoader.load<levels>(import.meta.glob('./../../assets/levels/*.json', { eager: true })),
	tilesets: await tileSetLoader.load<tilesets>(import.meta.glob('./../../assets/levels/tilesets/*.png', { eager: true })),
	characters: await characterLoader.load<characters>(import.meta.glob('./../../assets/characters/*.png', { eager: true })),
}
