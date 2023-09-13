import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { InputMap } from '@/lib/inputs'

const PlayerInputs = ['up', 'down', 'left', 'right', 'interact'] as const
@Component(ecs)
export class PlayerInputMap extends InputMap<typeof PlayerInputs> {
	constructor() {
		super(...PlayerInputs)
	}
}

export const getPlayerInputMap = () => {
	const map = new PlayerInputMap()
	map.get('up').setKey('KeyW')
	map.get('down').setKey('KeyS')
	map.get('left').setKey('KeyA')
	map.get('right').setKey('KeyD')
	map.get('interact').setKey('Enter')
	return map
}
