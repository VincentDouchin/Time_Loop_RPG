import { spawnBattlers, winOrLoseUiQuery } from './spawnBattlers'

import { assets, ecs } from '@/globals/init'
import { campfireBundle } from '@/items/campfire'
import { drawLayer } from '@/level/spawnLevel'
import { Component, Entity } from '@/lib/ECS'
import { CameraBounds } from '@/lib/camera'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { getBuffer } from '@/utils/buffer'

@Component(ecs)
export class Battle {}
export const spawnBattleBackground = () => {
	const level = assets.levels.minibattle.levels[0]
	const buffer = getBuffer(level.pxWid, level.pxHei)
	const battle = ecs.spawn()
	if (level.layerInstances) {
		for (const layerInstance of [...level.layerInstances].reverse()) {
			drawLayer(layerInstance, buffer)
			if (layerInstance.__type === 'Entities') {
				for (const entityInstance of layerInstance.entityInstances) {
					if (entityInstance.__identifier === 'Campfire') {
						battle.spawn(...campfireBundle(entityInstance, layerInstance))
					}
				}
			}
		}
		battle.addComponent(Sprite.fromBuffer(buffer), new Position(), new Battle(), CameraBounds.fromLevel(level))
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
