import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { assets } from '@/globals/init'
import type { LDTKEntityInstance } from '@/level/LDTKEntity'
import type { Entity } from '@/lib/ECS'

import { PixelTexture } from '@/lib/pixelTexture'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Log } from '@/utils/dialogHelpers'

export const logBundle = (split: boolean, entityInstance: LDTKEntityInstance, pos: Position) => (parent: Entity) => {
	if (split) {
		return parent.spawn(new Sprite(new PixelTexture(assets.staticItems.logSplit)), pos, new Log(), entityInstance)
			.withChildren((log) => {
				log.spawn(RigidBodyDesc.fixed(), ColliderDesc.cuboid(entityInstance.w / 2, entityInstance.h / 2), new Position(entityInstance.w / 2 + 8))
				log.spawn(RigidBodyDesc.fixed(), ColliderDesc.cuboid(entityInstance.w / 2, entityInstance.h / 2), new Position(-entityInstance.w / 2 - 8))
			})
	} else {
		return parent.spawn(new Sprite(new PixelTexture(assets.staticItems.log)), pos, ...entityInstance.body(), entityInstance, new Log())
	}
}