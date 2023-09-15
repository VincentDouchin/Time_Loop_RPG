import { Collider, ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { Vector2 } from 'three'
import { getPlayerInputMap } from './playerInputs'
import { Player } from '@/battle/spawnBattlers'
import { dialog } from '@/constants/dialog'
import { Dialog, NPCBundle } from '@/dungeon/NPC'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import type { EntityInstance, LayerInstance } from '@/level/LDTK'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { drawLayer, spawnIntGridEntities } from '@/level/spawnLevel'
import type { Class } from '@/lib/ECS'
import { Component, Entity } from '@/lib/ECS'
import { CameraBounds, CameraTarget } from '@/lib/camera'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { world, worldQuery } from '@/lib/world'
import { overworldState } from '@/main'
import { getBuffer } from '@/utils/buffer'
import { createDebugtexture } from '@/utils/debugTexture'
import { ColorShader } from '@/shaders/ColorShader'

@Component(ecs)
export class Dungeon {}
@Component(ecs)
export class Inside {}
@Component(ecs)
export class InsideTrigger {}
@Component(ecs)
export class Wall {}
@Component(ecs)
export class Outside {}
@Component(ecs)
export class Exit {}

const spawnLayer = (layer: LayerInstance) => {
	const buffer = getBuffer(layer.__cWid * layer.__gridSize, layer.__cHei * layer.__gridSize)
	drawLayer(layer, buffer)
	return Sprite.fromBuffer(buffer).setRenderOrder(layer.__identifier.includes('top') ? 100 : -1)
}

@Component(ecs)
export class SignPost extends LDTKEntityInstance<{ dialog: string }> {}

export const SignBundle = (sign: EntityInstance, layerInstance: LayerInstance) => {
	const signPost = new SignPost(sign)
	const components: InstanceType<Class>[] = [
		signPost,
		signPost.position(layerInstance),
		RigidBodyDesc.fixed(),
		ColliderDesc.cuboid(4, 4),
	]
	const signDialog = dialog[`sign${signPost.data.dialog}`]
	if (signDialog) {
		components.push(new Dialog(signDialog))
	}
	return components
}
export const PlayerBundle = (entityInstance: EntityInstance, layerInstance: LayerInstance) => {
	const pos = new LDTKEntityInstance(entityInstance).position(layerInstance)
	return [
		...TextureAtlas.bundle(assets.characters.paladin, 'idle', 'left', 'down'),
		pos,
		getPlayerInputMap(),
		new CameraTarget(),
		new Player(),
		RigidBodyDesc.dynamic(),
		ColliderDesc.cuboid(3, 3),
	]
}

export const spawnDungeon = () => {
	const mapFile = assets.levels.tavern
	const level = mapFile.levels[0]
	const map = ecs.spawn(
		new CameraBounds().setFromCenterAndSize(new Vector2(), new Vector2(level.pxWid, level.pxHei)),
		new Dungeon(),
	)

	if (level.layerInstances) {
		for (const layerInstance of [...level.layerInstances].reverse()) {
			if (layerInstance.__identifier.toLowerCase().includes('outside')) {
				map.spawn(spawnLayer(layerInstance), new Position(), new Outside())
			} else if (layerInstance.__identifier.toLowerCase().includes('inside')) {
				map.spawn(spawnLayer(layerInstance), new Position(), new Inside())
			} else {
				map.spawn(spawnLayer(layerInstance), new Position())
			}
			if (layerInstance.__identifier === 'Collisions') {
				spawnIntGridEntities(mapFile, layerInstance, t => t?.identifier === 'Wall',
					(wall, w, h) => {
						wall.addComponent(RigidBodyDesc.fixed(), ColliderDesc.cuboid(w / 2, h / 2), new Wall())
					})
				spawnIntGridEntities(mapFile, layerInstance, t => t?.identifier === 'Inside',
					(wall, w, h) => {
						wall.addComponent(new InsideTrigger(), RigidBodyDesc.fixed(), ColliderDesc.cuboid(w / 2, h / 2).setSensor(true))
					})
				spawnIntGridEntities(mapFile, layerInstance, t => t?.identifier === 'Shadow',
					(wall, w, h) => {
						const buffer = getBuffer(w + 16, h + 8)
						buffer.fillStyle = 'black'
						buffer.fillRect(0, 0, w + 16, h + 8)
						wall.addComponent(Sprite.fromBuffer(buffer), new Inside())
					})
			}
			if (layerInstance.__type === 'Entities') {
				for (const entityInstance of layerInstance.entityInstances) {
					if (entityInstance.__identifier === 'NPC') {
						map.spawn(...NPCBundle(entityInstance, layerInstance))
					}
					if (entityInstance.__identifier === 'Sign') {
						map.spawn(...SignBundle(entityInstance, layerInstance))
					}
					if (entityInstance.__identifier === 'Entrance') {
						map.spawn(...PlayerBundle(entityInstance, layerInstance))
					}
					if (entityInstance.__identifier === 'Exit') {
						const exit = new LDTKEntityInstance(entityInstance)
						map.spawn(exit, exit.position(layerInstance), ...exit.body(true), new Exit())
					}
				}
			}
		}
	}
}

const playerColliderQuery = ecs.query.pick(Collider, Position).with(Player)
const insideTriggersQuery = ecs.query.pick(Collider).with(InsideTrigger)
const insideQuery = ecs.query.pick(Sprite).with(Inside)
const outsideQuery = ecs.query.pick(Sprite, Entity).with(Outside)
export const isPlayerInside = () => {
	const playerCollider = playerColliderQuery.extract()
	const world = worldQuery.extract()
	if (playerCollider && world) {
		const isInside = insideTriggersQuery.toArray().some(([collider]) => world.intersectionPair(playerCollider, collider))

		for (const [sprite] of insideQuery.getAll()) {
			sprite.setOpacity(isInside ? 1 : 0)
		}
		for (const [sprite, entity] of outsideQuery.getAll()) {
			sprite.setOpacity(isInside ? 0 : 1)
			if (isInside && !entity.getComponent(ColorShader)) {
				entity.addComponent(new ColorShader([0, 0, 0, 0.3]))
			} else if (entity.getComponent(ColorShader)) {
				entity.removeComponent(ColorShader)
			}
		}
	}
}

const exitQuery = ecs.query.pick(Collider).with(Exit)
const dungeonQuery = ecs.query.pick(Entity).with(Dungeon)
export const exitDungeon = () => {
	for (const [playerCollider] of playerColliderQuery.getAll()) {
		for (const [exitCollider] of exitQuery.getAll()) {
			if (world.intersectionPair(playerCollider, exitCollider)) {
				for (const [entity] of dungeonQuery.getAll()) {
					entity.despawn()
				}
				overworldState.enable()
			}
		}
	}
}
