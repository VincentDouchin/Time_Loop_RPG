import type { JoystickManager } from 'nipplejs'
import nipplejs from 'nipplejs'
import type { Class, ECS } from './ECS'
import { Component } from './ECS'
import { ecs } from '@/globals/init'
import { context } from '@/save/context'

export const GAMEPAD_AXIS = {
	LEFT_X: 0,
	LEFT_Y: 1,
	RIGHT_X: 2,
	RIGHT_Y: 3,
}

export const GAMEPAD_BUTTON = {
	A: 0,
	B: 1,
	X: 2,
	Y: 3,
	L: 4,
	R: 5,
	L2: 6,
	R2: 7,
	SELECT: 8,
	START: 9,
	L3: 10,
	R3: 11,
	UP: 12,
	DOWN: 13,
	LEFT: 14,
	RIGHT: 15,
} as const

const keys: Record<string, boolean> = {}

export const changeControls = () => {
	window.addEventListener('touchstart', () => {
		context.controls = 'touch'
	})
	window.addEventListener('keydown', () => {
		context.controls = 'keyboard'
	})
	window.addEventListener('gamepadconnected', () => {
		context.controls = 'gamepad'
	})
}

window.addEventListener('keydown', (e) => {
	if (e.code in keys) {
		keys[e.code] = true
	}
})
window.addEventListener('keyup', (e) => {
	if (e.code in keys) {
		keys[e.code] = false
	}
})

window.addEventListener('touchstart', () => {
	document.body.requestFullscreen()
})

const touchJoystickInputs = {
	up: 0,
	down: 0,
	right: 0,
	left: 0,
	reset() {
		this.up = 0
		this.down = 0
		this.left = 0
		this.right = 0
	},
}
type touchDirection = 'up' | 'down' | 'left' | 'right'
let touchJoystick: null | JoystickManager = null

export const disableTouchJoystick = () => {
	touchJoystick?.destroy()
	touchJoystick = null
	touchJoystickInputs.reset()
}

export const enableTouchJoystick = () => {
	if (context.controls === 'touch' && !touchJoystick) {
		touchJoystick = nipplejs.create({ zone: document.body, size: 200 })
		touchJoystick.on('move', (_, data) => {
			const force = data.distance / 50
			if (Math.abs(data.vector.x) > 0.1) {
				if (data.vector.x > 0) {
					touchJoystickInputs.right = Math.abs(data.vector.x) * force
					touchJoystickInputs.left = 0
				} else {
					touchJoystickInputs.left = Math.abs(data.vector.x) * force
					touchJoystickInputs.right = 0
				}
			}
			if (Math.abs(data.vector.y) > 0.1) {
				if (data.vector.y > 0) {
					touchJoystickInputs.up = Math.abs(data.vector.y) * force
					touchJoystickInputs.down = 0
				} else {
					touchJoystickInputs.down = Math.abs(data.vector.y) * force
					touchJoystickInputs.up = 0
				}
			}
		})
		touchJoystick.on('removed', () => touchJoystickInputs.reset())
	}
	if (context.controls !== 'touch' && touchJoystick) {
		disableTouchJoystick()
	}
}

export class Input {
	pressed = 0
	wasPressed = 0
	buttons: number[] = []
	axis: { index: number; direction: 'up' | 'down' }[] = []
	codes: string[] = []
	touchAxis?: touchDirection
	setKey(...codes: string[]) {
		for (const code of codes) {
			keys[code] = false
		}
		this.codes.push(...codes)
		return this
	}

	setTouchAxis(axis: touchDirection) {
		this.touchAxis = axis
		return this
	}

	setButton(button: number) {
		this.buttons.push(button)
		return this
	}

	setAxis(axis: number, direction: 'up' | 'down') {
		this.axis.push({ index: axis, direction })
		return this
	}

	update(gamepad?: Gamepad) {
		for (const code of this.codes) {
			if (keys[code]) {
				this.pressed = 1
			}
		}
		if (this.touchAxis && Math.abs(touchJoystickInputs[this.touchAxis]) > 0.01) {
			this.pressed = touchJoystickInputs[this.touchAxis]
		}
		if (gamepad) {
			for (const button of this.buttons) {
				if (gamepad.buttons[button].pressed) {
					this.pressed = gamepad.buttons[button].value
				}
			}
			for (const axis of this.axis) {
				if (Math.abs(gamepad.axes[axis.index]) > 0.2 && (gamepad.axes[axis.index] > 0) !== (axis.direction === 'up')) {
					this.pressed = Math.abs(gamepad.axes[axis.index])
				}
			}
		}
	}

	get justPressed() {
		return this.wasPressed === 0 && this.pressed > 0
	}

	get justReleased() {
		return this.wasPressed > 0 && this.pressed === 0
	}
}

@Component(ecs)
export class InputMap<T extends readonly string[]> {
	inputs = new Map<T[number], Input>()
	#gamepads: number[] = []
	setGamepad(...gamepadIndexes: number[]) {
		this.#gamepads = gamepadIndexes
		return this
	}

	constructor(...inputNames: T) {
		for (const name of inputNames) {
			this.inputs.set(name, new Input())
		}
	}

	get(name: T[number]) {
		return this.inputs.get(name)!
	}

	reset() {
		for (const input of this.inputs.values()) {
			input.wasPressed = input.pressed
			input.pressed = 0
		}
	}

	updateInputsFromGamepad(gamepads: Gamepad[]) {
		for (const input of this.inputs.values()) {
			if (gamepads.filter(Boolean).length) {
				for (const gamepad of gamepads.filter((gamepad, i) => gamepad && this.#gamepads.includes(i))) {
					input.update(gamepad)
				}
			} else {
				input.update()
			}
		}
	}
}

export const registerInput = (...inputClasses: Class[]) => (ecs: ECS) => {
	for (const inputClass of inputClasses) {
		const inputsQuery = ecs.query.pick(inputClass)
		ecs.core.onPreUpdate(() => {
			for (const [inputMap] of inputsQuery.getAll()) {
				inputMap.updateInputsFromGamepad(navigator.getGamepads())
			}
		})
		ecs.core.onPostUpdate(() => {
			for (const [inputMap] of inputsQuery.getAll()) {
				inputMap.reset()
			}
		})
	}
}
