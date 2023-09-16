import { RigidBody } from '@dimforge/rapier2d-compat'
import { Vector2 } from 'three'
import { PlayerInputMap } from './playerInputs'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { Sprite, TextureAtlas } from '@/lib/sprite'

@Component(ecs)
export class LockedMovement {}

const playerQuery = ecs.query.pick(PlayerInputMap, RigidBody, TextureAtlas<'idle' | 'walk'>, Sprite).without(LockedMovement)
export const movePlayer = () => {
	for (const [inputs, body, atlas] of playerQuery.getAll()) {
		let isMoving = false
		const vel = new Vector2()
		if (inputs.get('up').pressed) {
			isMoving = true
			vel.y += inputs.get('up').pressed
			atlas.directionY = 'up'
		}
		if (inputs.get('down').pressed) {
			isMoving = true
			vel.y -= inputs.get('down').pressed
			atlas.directionY = 'down'
		}
		if (inputs.get('right').pressed) {
			isMoving = true
			vel.x += inputs.get('right').pressed
			atlas.directionX = 'right'
		}
		if (inputs.get('left').pressed) {
			isMoving = true
			vel.x -= inputs.get('left').pressed
			atlas.directionX = 'left'
		}
		const normalized = vel.clone().normalize()
		vel.max(normalized).multiplyScalar(70)

		body.setLinvel(vel, true)
		atlas.state = isMoving ? 'walk' : 'idle'
	}
}
