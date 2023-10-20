import { RigidBody } from '@dimforge/rapier2d-compat'
import { Group, Vector2, Vector3 } from 'three'
import { Component, Entity } from './ECS'
import { time } from './time'
import { ecs, world } from '@/globals/init'

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
	constructor(public speed: number) { }
}

@Component(ecs)
export class Velocity extends Vector2 { }

const positionQuery = ecs.query.pick(Position, Group)
export const updateSpritePosition = () => {
	for (const [pos, group] of positionQuery.getAll()) {
		group.getWorldPosition(pos.worldPosition)
		group.position.set(pos.x, pos.y, pos.z)
	}
}
const bodyPositionQuery = ecs.query.pick(Entity, Position, RigidBody)
export const updatePosition = () => {
	for (const [entity, pos, body] of bodyPositionQuery.getAll()) {
		if (pos.init) {
			const translation = body.translation()
			pos.x = translation.x
			pos.y = translation.y
		} else {
			const parentPosition = entity.parent?.getComponent(Position)
			if (parentPosition) {
				pos.x += parentPosition.x
				pos.y += parentPosition.y
			}
			body.setTranslation(new Vector2(pos.x, pos.y), true)
			pos.init = true
		}
	}
}
export const stepWorld = () => {
	world.timestep = time.delta / 1000
	world.step()
}

@Component(ecs)
export class YSorted {}
const YSortedSpritesQuery = ecs.query.pick(Position).with(YSorted)
export const sortSprites = () => {
	for (const [position] of YSortedSpritesQuery.getAll()) {
		position.z = (position.y * -0.01) + 4
	}
}