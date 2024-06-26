import type { IntGridValueDefinition, LDTKMap, LayerInstance } from './LDTK'
import { assets, ecs } from '@/globals/init'
import type { Entity } from '@/lib/ECS'
import { Component } from '@/lib/ECS'

import { Position } from '@/lib/transforms'
import { getFileName } from '@/utils/assetLoader'

@Component(ecs)
export class Map {}

export const drawLayer = (layerInstance: LayerInstance, buffer: OffscreenCanvasRenderingContext2D) => {
	if (layerInstance.__tilesetRelPath) {
		const tiles = layerInstance.__type === 'IntGrid' ? 'autoLayerTiles' : 'gridTiles'
		const tilesets = [assets.tilesets[getFileName(layerInstance.__tilesetRelPath) as tilesets]]
		const shadowMap = assets.tilesets?.[`${getFileName(layerInstance.__tilesetRelPath)}Shadows` as tilesets]
		if (shadowMap) {
			tilesets.unshift(shadowMap)
		}
		for (const tileset of tilesets) {
			for (const tile of layerInstance[tiles]) {
				buffer.drawImage(
					tileset,
					tile.src[0],
					tile.src[1],
					layerInstance.__gridSize,
					layerInstance.__gridSize,
					tile.px[0] + layerInstance.__pxTotalOffsetX,
					tile.px[1] + layerInstance.__pxTotalOffsetY,
					layerInstance.__gridSize,
					layerInstance.__gridSize,
				)
			}
		}
	}
}

interface Plate { t: number; l: number; b: number; r: number }
export const spawnIntGridEntities = (parent: Entity, map: LDTKMap, layer: LayerInstance, target: (index?: IntGridValueDefinition) => boolean, fn: (entity: Entity, w: number, h: number) => void = x => x) => {
	const rows: Plate[] = []
	for (let y = 0; y < layer.__cHei; y++) {
		let lastBlock: Plate | null = null
		for (let x = 0; x <= layer.__cWid; x++) {
			const index = y * layer.__cWid + x
			const wall = x === layer.__cWid ? false : target(map.defs.layers.find(l => l.identifier === layer.__identifier)?.intGridValues.find(intVal => intVal.value === layer.intGridCsv[index]))
			if (wall) {
				if (lastBlock === null) {
					lastBlock = { t: y, b: y, l: x, r: x }
				} else if (lastBlock && lastBlock) {
					lastBlock.r = x
				}
			} else if (lastBlock) {
				rows.push(lastBlock)
				lastBlock = null
			}
		}
	}
	const result: Plate[] = []
	for (const plate of rows) {
		const existingPlate = result.find(p => p.l === plate.l && p.r === plate.r && plate.t === p.b + 1)
		if (existingPlate) {
			existingPlate.b = plate.b
		} else {
			result.push(plate)
		}
	}
	for (const plate of result) {
		const w = (plate.r - plate.l + 1) * layer.__gridSize
		const h = (plate.b - plate.t + 1) * layer.__gridSize
		const position = new Position(
			plate.l * layer.__gridSize + w / 2 - layer.__cWid * layer.__gridSize / 2,
			-(plate.t * layer.__gridSize + h / 2 - layer.__cHei * layer.__gridSize / 2),
		)

		const tileEntity = parent.spawn(position)
		fn(tileEntity, w, h)
	}
}
