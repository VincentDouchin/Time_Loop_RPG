import type { Class } from './ECS'
import { Component } from './ECS'
import { ecs } from '@/globals/init'

class Input {
	pressed = false
	wasPressed = false
	setKey(...codes: string[]) {
		window.addEventListener('keydown', (e) => {
			if (codes.includes(e.code)) {
				this.pressed = true
			}
		})
		window.addEventListener('keyup', (e) => {
			if (codes.includes(e.code)) {
				this.pressed = false
			}
		})
	}

	get justPressed() {
		return this.wasPressed === false && this.pressed === true
	}

	get justReleased() {
		return this.wasPressed === true && this.pressed === false
	}
}

@Component(ecs)
export class InputMap<T extends readonly string[]> {
	#inputs = new Map<T[number], Input>()
	constructor(...inputNames: T) {
		for (const name of inputNames) {
			this.#inputs.set(name, new Input())
		}
	}

	get(name: T[number]) {
		return this.#inputs.get(name)!
	}

	reset() {
		for (const input of this.#inputs.values()) {
			input.wasPressed = input.pressed
		}
	}
}

export const updateInputs = (...inputClasses: Class[]) => {
	for (const inputClass of inputClasses) {
		const inputsQuery = ecs.query.pick(inputClass)

		ecs.core.onPostUpdate(() => {
			for (const [inputMap] of inputsQuery.getAll()) {
				inputMap.reset()
			}
		})
	}
}
