import { assets, ecs } from '@/globals/init'
import { spawnLevel } from '@/level/spawnLevel'
import { Component, Entity } from '@/lib/ECS'
import { CameraBounds } from '@/lib/camera'

@Component(ecs)
export class Map {}

export const spawnOverworld = spawnLevel(assets.levels.overworld.levels[0], new Map(), CameraBounds.fromLevel(assets.levels.overworld.levels[0]))
export const mapQuery = ecs.query.pick(Entity).with(Map)
export const despawnOverworld = () => {
	for (const [mapEntity] of mapQuery.getAll()) {
		mapEntity.despawn()
	}
}
