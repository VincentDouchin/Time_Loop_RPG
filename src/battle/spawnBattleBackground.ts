import { spawnBattlers, winOrLoseUiQuery } from './spawnBattlers'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { drawLayer } from '@/level/spawnLevel'
import { Component, Entity } from '@/lib/ECS'
import { CameraBounds } from '@/lib/camera'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { getBuffer } from '@/utils/buffer'

@Component(ecs)
export class Battle {}
export const currentLevel = assets.levels.minibattle.levels[0]
export const spawnBattleBackground = () => {
	const level = assets.levels.minibattle.levels[0]
	const buffer = getBuffer(level.pxWid, level.pxHei)
	if (level.layerInstances) {
		for (const layerInstance of [...level.layerInstances].reverse()) {
			drawLayer(layerInstance, buffer)
		}
		const battle = ecs.spawn(Sprite.fromBuffer(buffer), new Position(), new Battle(), CameraBounds.fromLevel(level))
		spawnBattlers(battle)
	}
}

const battleQuery = ecs.query.pick(Entity).with(Battle)
export const despawnBattle = () => {
	for (const [entity] of battleQuery.getAll()) {
		entity.despawn()
	}
	for (const [entity] of winOrLoseUiQuery.getAll()) {
		entity.despawn()
	}
}
