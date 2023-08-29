import type { LayerInstance, Level } from './LDTK'
import { NavNode } from './NavNode'
import { LDTKEntityInstance } from './LDTKEntity'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import type { Class, Entity } from '@/lib/ECS'

import { PixelTexture } from '@/lib/pixelTexture'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { getFileName } from '@/utils/assetLoader'
import { getBuffer } from '@/utils/buffer'

@Component(ecs)
export class Map {}

const drawLayer = (layerInstance: LayerInstance, buffer: CanvasRenderingContext2D, tiles: 'gridTiles' | 'autoLayerTiles') => {
	const tileset = assets.tilesets[getFileName(layerInstance.__tilesetRelPath!) as tilesets]
	for (const tile of layerInstance[tiles]) {
		buffer.drawImage(
			tileset,
			tile.src[0], tile.src[1], layerInstance.__gridSize, layerInstance.__gridSize,
			tile.px[0] + layerInstance.__pxTotalOffsetX, tile.px[1] + layerInstance.__pxTotalOffsetY, layerInstance.__gridSize, layerInstance.__gridSize,
		)
	}
}
const createNavNodes = (parent: Entity, layerInstance: LayerInstance) => {
	for (const entityInstance of layerInstance.entityInstances) {
		const entity = parent.spawn(...new NavNode(entityInstance).withPosition(layerInstance))
		LDTKEntityInstance.register(entity, entityInstance)
	}
}

export const spawnLevel = (level: Level, ...components: InstanceType<Class>[]) => () => {
	const buffer = getBuffer(level.pxWid, level.pxHei)
	const map = ecs.spawn(...components)
	if (level.layerInstances) {
		for (const layerInstance of level.layerInstances.reverse()) {
			switch (layerInstance.__type) {
			case 'IntGrid': drawLayer(layerInstance, buffer, 'autoLayerTiles')
				break
			case 'Tiles': drawLayer(layerInstance, buffer, 'gridTiles')
				break
			case 'Entities' : {
				layerInstance.__identifier === 'Nodes' && createNavNodes(map, layerInstance)
			}
			}
		}
		map.addComponent(new Sprite(new PixelTexture(buffer.canvas)), new Position())
	}
}
export const spawnOverworld = spawnLevel(assets.levels.overworld.levels[0], new Map())

export const mapQuery = ecs.query.with(Map)
export const despawnOverworld = () => {
	for (const [mapEntity] of mapQuery.getEntities()) {
		mapEntity.despawn()
	}
}
