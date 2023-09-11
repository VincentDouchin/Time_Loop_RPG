import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { PixelTexture } from '@/lib/pixelTexture'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { getBuffer } from '@/utils/buffer'

@Component(ecs)
export class Shadow {}
const addedShadowQuery = ecs.query.pick(Entity, Sprite).added(Shadow)
export const addShadow = () => {
	for (const [entity, sprite] of addedShadowQuery.getAll()) {
		const width = sprite.scaledDimensions.x / 3
		const height = sprite.scaledDimensions.y
		const shadowHeight = height / 8
		const buffer = getBuffer(width, height)
		buffer.fillStyle = 'black'
		buffer.ellipse(width / 2, shadowHeight / 2, width / 2, shadowHeight / 2, 0, 0, 2 * Math.PI)
		buffer.fill()
		entity.spawn(new Position(0, -height + shadowHeight / 1.5), new Sprite(new PixelTexture(buffer.canvas)).setOpacity(0.5).setRenderOrder(9))
	}
}
