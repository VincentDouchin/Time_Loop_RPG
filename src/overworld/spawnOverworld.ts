import { spawnOverworldCharacter } from './spawnOverworldCharacter'
import { CurrentNode } from './navigation'
import { assets, ecs } from '@/globals/init'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { NavNode } from '@/level/NavNode'
import { drawLayer } from '@/level/spawnLevel'
import { Component, Entity } from '@/lib/ECS'
import { CameraBounds } from '@/lib/camera'
import { PixelTexture } from '@/lib/pixelTexture'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { save, saveToLocalStorage } from '@/save/saveData'
import { getOffscreenBuffer } from '@/utils/buffer'

@Component(ecs)
export class Map {}

export const spawnOverworld = () => {
	const level = assets.levels.overworld.levels[1]
	const buffer = getOffscreenBuffer(level.pxWid, level.pxHei)
	const map = ecs.spawn(CameraBounds.fromLevel(level), new Map())
	if (level.layerInstances) {
		for (const layerInstance of [...level.layerInstances].reverse()) {
			switch (layerInstance.__type) {
			case 'IntGrid':
			case 'Tiles': drawLayer(layerInstance, buffer)
				break
			case 'Entities' : {
				if (layerInstance.__identifier === 'Nodes') {
					for (const entityInstance of layerInstance.entityInstances) {
						const navNode = new NavNode(entityInstance)
						const nodePosition = navNode.position(layerInstance)
						const entity = map.spawn(navNode, nodePosition)
						LDTKEntityInstance.register(entity, entityInstance)
						if (save.lastNodeUUID === navNode.id || (!save.lastNodeUUID && navNode.data.Start)) {
							map.spawn(...spawnOverworldCharacter(nodePosition))
							entity.addComponent(new CurrentNode())
						}
						if (navNode.data.Treasure) {
							const chestSprite = save.treasureFound.includes(navNode.data.Treasure)
								? assets.chests.woodChestOpen2
								: assets.chests.woodChestClosed2
							entity.addComponent(new Sprite(chestSprite).setRenderOrder(1).anchor(0, 0.5))
						}
					}
				}
			}
			}
		}
		map.addComponent(new Sprite(new PixelTexture(buffer.canvas)), new Position())
	}
}
export const mapQuery = ecs.query.pick(Entity).with(Map)
export const despawnOverworld = () => {
	for (const [mapEntity] of mapQuery.getAll()) {
		mapEntity.despawn()
	}
}

export const setOverwolrdState = () => 	{
	save.lastState = 'overworld'
	saveToLocalStorage()
}
