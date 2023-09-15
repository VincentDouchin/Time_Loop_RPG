import { RigidBody } from '@dimforge/rapier2d-compat'
import { PlayerInputMap } from './playerInputs'
import { ecs } from '@/globals/init'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Component } from '@/lib/ECS'

@Component(ecs)
export class LockedMovement {}

const playerQuery = ecs.query.pick(PlayerInputMap, RigidBody, TextureAtlas<'idle' | 'walk'>, Sprite).without(LockedMovement)
export const movePlayer = () => {
	for (const [inputs, body, atlas] of playerQuery.getAll()) {
		const speed = 50
		let isMoving = false
		const vel = { x: 0, y: 0 }
		if (inputs.get('up').pressed) {
			isMoving = true
			vel.y += speed
			atlas.directionY = 'up'
		}
		if (inputs.get('down').pressed) {
			isMoving = true
			vel.y -= speed
			atlas.directionY = 'down'
		}
		if (inputs.get('right').pressed) {
			isMoving = true
			vel.x += speed
			atlas.directionX = 'right'
		}
		if (inputs.get('left').pressed) {
			isMoving = true
			vel.x -= speed
			atlas.directionX = 'left'
		}
		body.setLinvel(vel, true)
		atlas.state = isMoving ? 'walk' : 'idle'
	}
}
