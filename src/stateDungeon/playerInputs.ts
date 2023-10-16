import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { GAMEPAD_AXIS, GAMEPAD_BUTTON, InputMap } from '@/lib/inputs'

const PlayerInputs = ['up', 'down', 'left', 'right', 'interact'] as const
@Component(ecs)
export class PlayerInputMap extends InputMap<typeof PlayerInputs> {
	constructor() {
		super(...PlayerInputs)
	}
}

export const getPlayerInputMap = () => {
	const map = new PlayerInputMap().setGamepad(0)
	map.get('up')
		.setKey('KeyW')
		.setButton(GAMEPAD_BUTTON.UP)
		.setAxis(GAMEPAD_AXIS.LEFT_Y, 'up')
		.setTouchAxis('up')
	map.get('down')
		.setKey('KeyS')
		.setButton(GAMEPAD_BUTTON.DOWN)
		.setAxis(GAMEPAD_AXIS.LEFT_Y, 'down')
		.setTouchAxis('down')
	map.get('left')
		.setKey('KeyA')
		.setButton(GAMEPAD_BUTTON.LEFT)
		.setAxis(GAMEPAD_AXIS.LEFT_X, 'up')
		.setTouchAxis('left')
	map.get('right')
		.setKey('KeyD')
		.setButton(GAMEPAD_BUTTON.RIGHT)
		.setAxis(GAMEPAD_AXIS.LEFT_X, 'down')
		.setTouchAxis('right')
	map.get('interact')
		.setKey('Enter')
		.setButton(GAMEPAD_BUTTON.A)
	return map
}
