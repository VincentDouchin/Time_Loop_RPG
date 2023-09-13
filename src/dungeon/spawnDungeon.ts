import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { Vector2 } from 'three'
import { PlayerInputMap, getPlayerInputMap } from './playerInputs'
import { Player } from '@/battle/spawnBattlers'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import type { LayerInstance } from '@/level/LDTK'
import { drawLayer, spawnIntGridEntities } from '@/level/spawnLevel'
import { Component } from '@/lib/ECS'
import { textureAtlasBundle } from '@/lib/bundles'
import { CameraBounds, CameraTarget, mainCameraQuery } from '@/lib/camera'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { worldQuery } from '@/lib/world'
import { getBuffer } from '@/utils/buffer'

@Component(ecs)
export class Inside {}
@Component(ecs)
export class InsideTrigger {}
@Component(ecs)
export class Wall {}
@Component(ecs)
export class Outside {}
const spawnLayer = (layer: LayerInstance) => {
	const buffer = getBuffer(layer.__cWid * layer.__gridSize, layer.__cHei * layer.__gridSize)
	drawLayer(layer, buffer)
	return Sprite.fromBuffer(buffer).setRenderOrder(layer.__identifier.includes('top') ? 100 : -1)
}
export const spawnDungeon = () => {
	const mapFile = assets.levels.tavern
	const level = mapFile.levels[0]
	const map = ecs.spawn(new CameraBounds().setFromCenterAndSize(new Vector2(), new Vector2(level.pxWid, level.pxHei)))
	if (level.layerInstances) {
		for (const layerInstance of level.layerInstances.reverse()) {
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
			}
		}
	}
}
export const spawnPlayer = () => {
	ecs.spawn(
		...textureAtlasBundle(assets.characters.paladin, 'idle', 'left', 'down'),
		new Position(-50),
		getPlayerInputMap(),
		new CameraTarget(),
		new Player(),
		RigidBodyDesc.dynamic(),
		ColliderDesc.cuboid(3, 3),
	)
}
export const updateCamera = () => {
	for (const [camera] of mainCameraQuery.getAll()) {
		camera.zoom = 7
		camera.updateProjectionMatrix()
	}
}

const playerQuery = ecs.query.pick(PlayerInputMap, RigidBody, TextureAtlas<'idle' | 'walk'>, Sprite)
export const movePlayer = () => {
	for (const [inputs, body, atlas] of playerQuery.getAll()) {
		const speed = 50
		let isMoving = false
		const vel = { x: 0, y: 0 }
		if (inputs.get('up').pressed) {
			isMoving = true
			vel.y += speed
			atlas.directionY = 'up'
		}
		if (inputs.get('down').pressed) {
			isMoving = true
			vel.y -= speed
			atlas.directionY = 'down'
		}
		if (inputs.get('right').pressed) {
			isMoving = true
			vel.x += speed
			atlas.directionX = 'right'
		}
		if (inputs.get('left').pressed) {
			isMoving = true
			vel.x -= speed
			atlas.directionX = 'left'
		}
		body.setLinvel(vel, true)
		atlas.state = isMoving ? 'walk' : 'idle'
	}
}

const playerColliderQuery = ecs.query.pick(Collider, Position).with(Player)
const insideTriggersQuery = ecs.query.pick(Collider).with(InsideTrigger)
const insideQuery = ecs.query.pick(Sprite).with(Inside)
const outsideQuery = ecs.query.pick(Sprite).with(Outside)
export const isPlayerInside = () => {
	const playerCollider = playerColliderQuery.extract()
	const world = worldQuery.extract()
	if (playerCollider && world) {
		const isInside = insideTriggersQuery.toArray().some(([collider]) => world.intersectionPair(playerCollider, collider))
		for (const [sprite] of insideQuery.getAll()) {
			sprite.setOpacity(isInside ? 1 : 0)
		}
		for (const [sprite] of outsideQuery.getAll()) {
			sprite.setOpacity(isInside ? 0 : 1)
		}
	}
}
