import { Player } from '@/battle/spawnBattlers'
import type { direction } from '@/dungeon/spawnDungeon'
import { assets } from '@/globals/init'
import type { Entity } from '@/lib/ECS'
import { CameraTarget } from '@/lib/camera'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Navigator } from '@/overworld/navigation'
import { save } from '@/save/saveData'

export const getOtherDirection = (dir: direction): direction => {
	const otherDirections: Record<direction, direction> = {
		up: 'down',
		down: 'up',
		left: 'right',
		right: 'left',
	}
	return otherDirections[dir]
}

export const spawnOverworldCharacter = (node: Entity, nodePosition: Position) => {
	const [sprite, animator, textureAtlas] = TextureAtlas.bundle(assets.characters.paladin, 'idle', 'left', 'down')
	sprite.setRenderOrder(10)
	const direction = save.lastState === 'dungeon' && save.lastDirection
		? getOtherDirection(save.lastDirection)
		: null
	return [sprite,
		animator,
		textureAtlas,
		new CameraTarget(),
		new Position(nodePosition.x, nodePosition.y),
		new Navigator(node, direction),
		new Player()]
}
