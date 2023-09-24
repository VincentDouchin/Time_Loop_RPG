import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { GAMEPAD_BUTTON, InputMap } from '@/lib/inputs'
import { Interactable } from '@/lib/interactions'

const MenuInputs = ['Pause', 'Up', 'Down', 'Right', 'Left', 'Enter'] as const

@Component(ecs)
export class MenuInputMap extends InputMap<typeof MenuInputs> {
	constructor() {
		super(...MenuInputs)
	}
}
export const spawnMenuInputs = () => {
	const inputs = new MenuInputMap().setGamepad(0)
	inputs.get('Pause').setKey('Escape').setButton(GAMEPAD_BUTTON.SELECT)
	inputs.get('Up').setKey('ArrowUp').setButton(GAMEPAD_BUTTON.UP)
	inputs.get('Down').setKey('ArrowDown').setButton(GAMEPAD_BUTTON.DOWN)
	inputs.get('Right').setKey('ArrowRight').setButton(GAMEPAD_BUTTON.RIGHT)
	inputs.get('Left').setKey('ArrowLeft').setButton(GAMEPAD_BUTTON.LEFT)
	inputs.get('Enter').setKey('Enter').setButton(GAMEPAD_BUTTON.START)
	ecs.spawn(inputs)
}

export const menuInputQuery = ecs.query.pick(MenuInputMap)

@Component(ecs)
export class MenuInputInteractable {
	constructor(public input: typeof MenuInputs[number]) {}
}

const physicalMenuInputsQuery = ecs.query.pick(MenuInputInteractable, Interactable)
export const clickOnMenuInput = () => {
	const inputMap = menuInputQuery.extract()
	if (inputMap) {
		for (const [menuInteractable, interactable] of physicalMenuInputsQuery.getAll()) {
			if (interactable.justPressed) {
				inputMap.get(menuInteractable.input).pressed = 1
			}
		}
	}
}
