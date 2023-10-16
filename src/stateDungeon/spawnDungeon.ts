import { Collider, ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { Group } from 'three'
import { getPlayerInputMap } from './playerInputs'
import { Dialog } from './dialog'
import { dialog, hasKey } from '@/constants/dialogs'
import { Log } from '@/utils/dialogHelpers'
import { NPCBundle } from '@/stateDungeon/NPC'
import { Player } from '@/generic/components'
import { assets, ecs, world } from '@/globals/init'
import type { EntityInstance, LayerInstance } from '@/level/LDTK'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { drawLayer, spawnIntGridEntities } from '@/level/spawnLevel'
import type { Class, System } from '@/lib/ECS'
import { Component, Entity } from '@/lib/ECS'
import { CameraBounds, CameraTarget } from '@/lib/camera'
import { PixelTexture } from '@/lib/pixelTexture'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import type { dungeonRessources } from '@/main'
import { overworldState } from '@/main'
import { save, saveToLocalStorage } from '@/save/saveData'
import { ColorShader } from '@/shaders/ColorShader'
import { getOffscreenBuffer } from '@/utils/buffer'

export type direction = 'left' | 'right' | 'up' | 'down'
@Component(ecs)
export class Dungeon { }
@Component(ecs)
export class Inside { }
@Component(ecs)
export class InsideTrigger { }
@Component(ecs)
export class Wall { }
@Component(ecs)
export class Outside { }
@Component(ecs)
export class DarkenWhenInside { }
@Component(ecs)
export class JustEntered { }
@Component(ecs)
export class Entrance extends LDTKEntityInstance<{ direction: direction }> { }

const spawnLayer = (layer: LayerInstance) => {
	const buffer = getOffscreenBuffer(layer.__cWid * layer.__gridSize, layer.__cHei * layer.__gridSize)
	drawLayer(layer, buffer)
	return Sprite.fromBuffer(buffer).setRenderOrder(layer.__identifier.includes('top') ? 100 : -1)
}

@Component(ecs)
export class SignPost extends LDTKEntityInstance<{ dialog: string }> { }

export const SignBundle = (sign: EntityInstance, layerInstance: LayerInstance) => {
	const signPost = new SignPost(sign)
	const components: InstanceType<Class>[] = [
		signPost,
		signPost.position(layerInstance),
		RigidBodyDesc.fixed(),
		ColliderDesc.cuboid(4, 4),
		new Group(),
	]
	const signDialog = dialog[`sign${signPost.data.dialog}`]
	if (signDialog) {
		components.push(...new Dialog(signDialog).withMenu())
	}
	return components
}

export const PlayerBundle = (pos: Position) => {
	const bundle = TextureAtlas.bundle(assets.characters.paladin, 'idle', 'left', 'down')
	bundle[0].setRenderOrder(10)
	return [
		...bundle,
		new Position(pos.x, pos.y),
		getPlayerInputMap(),
		new CameraTarget(),
		new Player(),
		new JustEntered(),
		RigidBodyDesc.dynamic(),
		ColliderDesc.cuboid(3, 3),
	]
}
export const logBundle = (split: boolean, entityInstance: LDTKEntityInstance, pos: Position) => (parent: Entity) => {
	if (split) {
		return parent.spawn(new Sprite(new PixelTexture(assets.staticItems.logSplit)), pos, new Log(), entityInstance)
			.withChildren((log) => {
				log.spawn(RigidBodyDesc.fixed(), ColliderDesc.cuboid(entityInstance.w / 2, entityInstance.h / 2), new Position(entityInstance.w / 2 + 8))
				log.spawn(RigidBodyDesc.fixed(), ColliderDesc.cuboid(entityInstance.w / 2, entityInstance.h / 2), new Position(-entityInstance.w / 2 - 8))
			})
	} else {
		return parent.spawn(new Sprite(new PixelTexture(assets.staticItems.log)), pos, ...entityInstance.body(), entityInstance, new Log())
	}
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
				spawnIntGridEntities(map, mapFile, layerInstance, t => t?.identifier === 'Wall',					(wall, w, h) => {
					wall.addComponent(RigidBodyDesc.fixed(), ColliderDesc.cuboid(w / 2, h / 2), new Wall())
				})
				spawnIntGridEntities(map, mapFile, layerInstance, t => t?.identifier === 'Inside',					(wall, w, h) => {
					wall.addComponent(new InsideTrigger(), RigidBodyDesc.fixed(), ColliderDesc.cuboid(w / 2, h / 2).setSensor(true))
				})
				spawnIntGridEntities(map, mapFile, layerInstance, t => t?.identifier === 'Shadow',					(wall, w, h) => {
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
