import { assets } from '@/globals/assets'
import type { EntityInstance, LayerInstance } from '@/level/LDTK'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { TextureAtlas } from '@/lib/sprite'

export const campfireBundle = (entityInstance: EntityInstance, layerInstance: LayerInstance) => {
	const bundle = TextureAtlas.single(assets.animatedTextures.campfire)
	const [sprite] = bundle
	sprite.setRenderOrder(1)
	const campfire = new LDTKEntityInstance(entityInstance)

	return [campfire, campfire.position(layerInstance), ...bundle]
}
