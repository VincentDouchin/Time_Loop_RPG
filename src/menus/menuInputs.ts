import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { InputMap } from '@/lib/inputs'

const MenuInputs = ['Pause', 'Up', 'Down', 'Right', 'Left'] as const

@Component(ecs)
export class MenuInputMap extends InputMap<typeof MenuInputs> {
	constructor() {
		super(...MenuInputs)
	}
}
export const spawnMenuInputs = () => {
	const inputs = new MenuInputMap()
	inputs.get('Pause').setKey('Escape')
	inputs.get('Up').setKey('ArrowUp')
	inputs.get('Down').setKey('ArrowDown')
	inputs.get('Right').setKey('ArrowRight')
	inputs.get('Left').setKey('ArrowLeft')
	ecs.spawn(inputs)
}

export const menuInputQuery = ecs.query.pick(MenuInputMap)
