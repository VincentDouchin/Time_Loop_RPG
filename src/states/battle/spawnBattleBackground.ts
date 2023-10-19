import { spawnBattlers, winOrLoseUiQuery } from './spawnBattlers'
import type { BattleData } from '@/constants/battles'

import { assets, ecs } from '@/globals/init'
import { campfireBundle } from '@/items/campfire'
import { drawLayer } from '@/level/spawnLevel'
import type { System } from '@/lib/ECS'
import { Component, Entity } from '@/lib/ECS'
import { CameraBounds } from '@/lib/camera'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { save } from '@/save/saveData'
import { getOffscreenBuffer } from '@/utils/buffer'

@Component(ecs)
export class Battle {}
export const spawnBattle: System<[BattleData]> = ({ enemies, background }) => {
	save.lastState = 'battle'
	const level = assets.levels.minibattle.levels[background]
	const buffer = getOffscreenBuffer(level.pxWid, level.pxHei)
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
		spawnBattlers(battle, background, enemies)
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