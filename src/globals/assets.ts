import { AssetLoaderChain, getFileName, loadImage, splitTexture } from '../utils/assetLoader'
import { PixelTexture } from '@/lib/pixelTexture'
import type { LDTKMap } from '@/level/LDTK'

const levelLoader = new AssetLoaderChain<LDTKMap>(getFileName)

const spriteLoader = new AssetLoaderChain(getFileName)
	.chain((m, _) => loadImage(m.default))
	.chain((v, _) => new PixelTexture(v))

const tileSetLoader = new AssetLoaderChain(getFileName)
	.chain((m, _) => loadImage(m.default))

const textureAtlasLoader = new AssetLoaderChain(getFileName)
	.chain(m => loadImage(m.default))
	.chain((img, _, k) => {
		const tiles = k.includes('idle') ? 2 : 4
		return splitTexture(tiles)(img)
	})
	.chain(atlas => atlas.map(canvas => new PixelTexture(canvas)))
export const assets = {
	// characters: await textureAtlasLoader.load<characters>(import.meta.glob('./../../assets/characters/*.png', { eager: true })),
	// levels: await levelLoader.load<levels>(import.meta.glob('./../../assets/levels/*.json', { eager: true })),
	// weapons: await spriteLoader.load<Weapons>(import.meta.glob('./../../assets/Weapons/*.png', { eager: true })),
	// bullets: await spriteLoader.load<Effects>(import.meta.glob('./../../assets/Weapons/Effects/*.png', { eager: true })),
	// tileset: await tileSetLoader.load<tileset>(import.meta.glob('./../../assets/tileset/*.png', { eager: true })),
}
