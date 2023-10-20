import { assets, ecs } from '@/globals/init'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { Component } from '@/lib/ECS'
import { PixelTexture } from '@/lib/pixelTexture'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position, YSorted } from '@/lib/transforms'

@Component(ecs)
export class Portal extends LDTKEntityInstance<{ size: 'tiny' | 'small' | 'medium' | 'big1' | 'big2' }> {}

export const portalBundle = (portal: Portal, position: Position) => (parent: Entity) => {
	const size = portal.data.size
	const portalEntity = parent.spawn(new Sprite(new PixelTexture(assets.portals.sizes[size])), position, portal,new YSorted())
	if (size !== 'tiny') {
		portalEntity.spawn(...TextureAtlas.single(assets.portals.animations[size].start), new Position())
	}
}