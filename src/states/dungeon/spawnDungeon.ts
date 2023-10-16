import { Collider, ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { DarkenWhenInside, Dungeon, Entrance, Inside, InsideTrigger, JustEntered, Outside, Wall } from './dungeonComponents'
import { logBundle } from './log'
import { SignBundle } from './sign'
import { PlayerBundle } from './player'
import { hasKey } from '@/constants/dialogs'
import { Player } from '@/generic/components'
import type { dungeonRessources } from '@/globals/init'
import { assets, ecs, overworldState, world } from '@/globals/init'
import type { LayerInstance } from '@/level/LDTK'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { drawLayer, spawnIntGridEntities } from '@/level/spawnLevel'
import type { System } from '@/lib/ECS'
import { Entity } from '@/lib/ECS'
import { CameraBounds } from '@/lib/camera'
import { Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { save, saveToLocalStorage } from '@/save/saveData'
import { ColorShader } from '@/shaders/ColorShader'
import { NPCBundle } from '@/states/dungeon/NPC'
import { getOffscreenBuffer } from '@/utils/buffer'

export type direction = 'left' | 'right' | 'up' | 'down'
const spawnLayer = (layer: LayerInstance) => {
	const buffer = getOffscreenBuffer(layer.__cWid * layer.__gridSize, layer.__cHei * layer.__gridSize)
	drawLayer(layer, buffer)
	return Sprite.fromBuffer(buffer).setRenderOrder(layer.__identifier.includes('top') ? 100 : -1)
}

export const spawnDungeon: System<dungeonRessources> = (mapName, levelIndex, direction) => {
	const mapFile = assets.levels[mapName]
	const level = mapFile.levels[levelIndex]
	const map = ecs.spawn(
		CameraBounds.fromLevel(level),
		new Dungeon(),
	)

	if (level.layerInstances) {
		for (const layerInstance of [...level.layerInstances].reverse()) {
			if (layerInstance.__identifier.toLowerCase().includes('outside')) {
				map.spawn(spawnLayer(layerInstance), new Position(), new Outside(), new DarkenWhenInside())
			} else if (layerInstance.__identifier.toLowerCase().includes('inside')) {
				map.spawn(spawnLayer(layerInstance), new Position(), new Inside())
			} else {
				map.spawn(spawnLayer(layerInstance), new Position(), new DarkenWhenInside())
			}
			if (layerInstance.__identifier === 'Collisions') {
				spawnIntGridEntities(map, mapFile, layerInstance, t => t?.identifier === 'Wall', (wall, w, h) => {
					wall.addComponent(RigidBodyDesc.fixed(), ColliderDesc.cuboid(w / 2, h / 2), new Wall())
				})
				spawnIntGridEntities(map, mapFile, layerInstance, t => t?.identifier === 'Inside', (wall, w, h) => {
					wall.addComponent(new InsideTrigger(), RigidBodyDesc.fixed(), ColliderDesc.cuboid(w / 2, h / 2).setSensor(true))
				})
				spawnIntGridEntities(map, mapFile, layerInstance, t => t?.identifier === 'Shadow', (wall, w, h) => {
					const buffer = getOffscreenBuffer(w + 16, h + 8)
					buffer.fillStyle = 'black'
					buffer.fillRect(0, 0, w + 16, h + 8)
					wall.addComponent(Sprite.fromBuffer(buffer), new Inside())
				})
			}
			if (layerInstance.__type === 'Entities') {
				for (const entityInstance of layerInstance.entityInstances) {
					switch (entityInstance.__identifier) {
						case 'NPC': map.spawn(...NPCBundle(entityInstance, layerInstance))
							break
						case 'Sign': map.spawn(...SignBundle(entityInstance, layerInstance))
							break
						case 'Entrance': {
							const entrance = new Entrance(entityInstance)
							const position = entrance.position(layerInstance)
							map.spawn(entrance, position, ...entrance.body(true))
							if (entrance.data.direction === direction) {
								map.spawn(...PlayerBundle(position))
							}
						}; break
						case 'Log': {
							const log = new LDTKEntityInstance(entityInstance)
							map.spawn(logBundle(hasKey('splitLog'), log, log.position(layerInstance)))
						}
					}
				}
			}
		}
	}
}

const spritesToDarkenQuery = ecs.query.pick(Entity).with(DarkenWhenInside)
const playerColliderQuery = ecs.query.pick(Collider, Position, Entity).with(Player)
const insideTriggersQuery = ecs.query.pick(Collider).with(InsideTrigger)
const insideQuery = ecs.query.pick(Sprite).with(Inside)
const outsideQuery = ecs.query.pick(Sprite, Entity).with(Outside)
export const isPlayerInside = () => {
	const playerCollider = playerColliderQuery.extract()

	if (playerCollider) {
		const isInside = insideTriggersQuery.toArray().some(([collider]) => world.intersectionPair(playerCollider, collider))

		for (const [sprite] of insideQuery.getAll()) {
			sprite.setOpacity(isInside ? 1 : 0)
		}
		for (const [sprite] of outsideQuery.getAll()) {
			sprite.setOpacity(isInside ? 0 : 1)
		}
		if (isInside) {
			for (const [entity] of spritesToDarkenQuery.getAll()) {
				if (!entity.getComponent(ColorShader)) {
					entity.addComponent(new ColorShader([0.3, 0.3, 0.3, 1]))
				}
			}
		} else {
			for (const [entity] of spritesToDarkenQuery.getAll()) {
				entity.removeComponent(ColorShader)
			}
		}
	}
}

const playerExitQuery = ecs.query.pick(Collider).with(Player).without(JustEntered)
const exitQuery = ecs.query.pick(Collider, Entrance)
export const exitDungeon = () => {
	for (const [playerCollider] of playerExitQuery.getAll()) {
		for (const [exitCollider, entrance] of exitQuery.getAll()) {
			if (world.intersectionPair(playerCollider, exitCollider)) {
				save.lastDirection = entrance.data.direction
				saveToLocalStorage()
				overworldState.enable()
			}
		}
	}
}
const justEnteredQuery = ecs.query.pick(Entity, Collider).with(JustEntered)
export const allowPlayerToExit = () => {
	for (const [entity, collider] of justEnteredQuery.getAll()) {
		const isInEntrance = exitQuery.toArray().some(([entranceCollider]) => {
			return world.intersectionPair(entranceCollider, collider)
		})
		if (!isInEntrance) {
			entity.removeComponent(JustEntered)
		}
	}
}

export const setDungeonState: System<dungeonRessources> = (mapName, level, direction) => {
	save.lastDungeon = mapName
	save.lastLevelIndex = level
	save.lastDirection = direction
	save.lastState = 'dungeon'
	saveToLocalStorage()
}
