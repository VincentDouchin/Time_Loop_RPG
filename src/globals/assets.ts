import { AssetLoaderChain, createAtlas, getFileName, loadImage } from '../utils/assetLoader'
import { animations } from '@/constants/animations'
import type { LDTKMap } from '@/level/LDTK'
import { PixelTexture } from '@/lib/pixelTexture'

const levelLoader = new AssetLoaderChain<LDTKMap>(getFileName)

const uiLoader = new AssetLoaderChain(getFileName)
	.chain(async (m) => {
		const img = await loadImage(m.default)
		return {
			path: m.default,
			width: img.width,
			height: img.height,
		}
	})
const spriteLoader = new AssetLoaderChain(getFileName)
	.chain(m => loadImage(m.default))
	.chain(img => new PixelTexture(img))
const tileSetLoader = new AssetLoaderChain(getFileName)
	.chain((m, _) => loadImage(m.default))

const characterLoader = new AssetLoaderChain(getFileName)
	.chain(m => loadImage(m.default))
	.chain((img, _, k) => createAtlas(img, animations[k as characters], 32, 32))

const fontLoader = new AssetLoaderChain(getFileName)
	.chain(async (m, _, name) => {
		const font = new FontFace(name, `url(${m.default})`)
		await font.load()
		document.fonts.add(font)
	})
export const assets = {
	levels: await levelLoader.load<levels>(import.meta.glob('./../../assets/levels/*.json', { eager: true })),
	tilesets: await tileSetLoader.load<tilesets>(import.meta.glob('./../../assets/levels/tilesets/*.png', { eager: true })),
	characters: await characterLoader.load<characters>(import.meta.glob('./../../assets/characters/*.png', { eager: true })),
	ui: await uiLoader.load<ui>(import.meta.glob('./../../assets/ui/*.png', { eager: true })),
	fonts: await fontLoader.load<fonts>(import.meta.glob('./../../assets/fonts/*.*', { eager: true })),
	background: await spriteLoader.load<backgrounds>(import.meta.glob('./../../assets/backgrounds/*.png', { eager: true })),
}
