import { Group, Vector2, Vector3 } from 'three'
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
