import { Group, Vector2, Vector3 } from 'three'
import { RigidBody } from '@dimforge/rapier2d-compat'
import { Component } from './ECS'
import { ecs } from '@/globals/init'

@Component(ecs)
export class Position extends Vector3 {
	init = false
	worldPosition = new Vector3()
	get xy() {
		return new Vector2(this.x, this.y)
	}
}
@Component(ecs)
export class Speed {
	constructor(public speed: number) {}
}

@Component(ecs)
export class Velocity extends Vector2 { }

const bodyPositionQuery = ecs.query.pick(Position, RigidBody)
export const updatePosition = () => {
	for (const [pos, body] of bodyPositionQuery.getAll()) {
		if (pos.init) {
			const translation = body.translation()
			pos.x = translation.x
			pos.y = translation.y
		} else {
			body.setTranslation(new Vector2(pos.x, pos.y), true)
			pos.init = true
		}
	}
}

const positionQuery = ecs.query.pick(Position, Group)
export const updateSpritePosition = () => {
	for (const [pos, group] of positionQuery.getAll()) {
		group.getWorldPosition(pos.worldPosition)
		group.position.set(pos.x, pos.y, pos.z)
	}
}

const velocityQuery = ecs.query.pick(RigidBody, Velocity)
export const applyVelocity = () => {
	for (const [body, vel] of velocityQuery.getAll()) {
		body.setLinvel(vel, true)
	}
}
export const resetVel = () => {
	for (const [body, vel] of velocityQuery.getAll()) {
		vel.x = body.linvel().x
		vel.y = body.linvel().y
	}
}
