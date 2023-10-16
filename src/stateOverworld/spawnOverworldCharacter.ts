import type { direction } from '@/stateDungeon/spawnDungeon'
import { Player } from '@/generic/components'
import { assets } from '@/globals/init'
import { CameraTarget } from '@/lib/camera'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { DecidingDirection, Navigator } from '@/stateOverworld/navigation'
import { context } from '@/save/context'
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

export const spawnOverworldCharacter = (nodePosition: Position) => {
	const [sprite, animator, textureAtlas] = TextureAtlas.bundle(assets.characters.paladin, 'idle', 'left', 'down')
	sprite.setRenderOrder(10)
	let direction: null | direction = null
	if (context.startup) {
		context.startup = false
	} else if (['overwold', 'battle'].includes(save.lastState) && save.lastDirection) {
		direction = save.lastDirection
	}
	if (save.lastState === 'dungeon' && save.lastDirection) {
		direction = getOtherDirection(save.lastDirection)
	}

	return [
		sprite,
		animator,
		textureAtlas,
		new CameraTarget(),
		new Position(nodePosition.x, nodePosition.y),
		new Navigator(direction),
		new Player(),
		new DecidingDirection(),
	]
}
