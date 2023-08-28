import { Animator } from './animation'
import type { TextureAltasStates } from './sprite'
import { Sprite, TextureAtlas } from './sprite'

export const textureAtlasBundle = <K extends string>(textureAtlas: TextureAltasStates<K>, defaultState: K, delay: number) => {
	return [new Sprite(textureAtlas[defaultState][0]), new Animator(delay), new TextureAtlas(textureAtlas, defaultState)] as const
}
