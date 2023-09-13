import { Animator } from './animation'
import type { TextureAltasStates, directionX, directionY } from './sprite'
import { Sprite, TextureAtlas } from './sprite'

export const textureAtlasBundle = <K extends string>(textureAtlas: TextureAltasStates<K>, defaultState: K, directionX: directionX = 'left', directionY: directionY = 'down') => {
	const atlas = new TextureAtlas(textureAtlas, defaultState, directionX, directionY)
	return [new Sprite(atlas.currentTexture), new Animator(100), atlas] as const
}
