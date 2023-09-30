import { assets, ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { save } from '@/save/saveData'
import { NineSlice } from '@/ui/NineSlice'
import { TextElement, UIElement } from '@/ui/UiElement'

@Component(ecs)
export class StepsUi {
	text?: TextElement
	constructor() {}
	getTextElement() {
		this.text = new TextElement(String(save.steps), 2)
		return this.text
	}

	update() {
		if (this.text) {
			this.text.textContent = String(save.steps)
		}
	}
}

export const spawnStepsUi = () => {
	const steps = new StepsUi()
	ecs.spawn(
		new UIElement({ position: 'absolute', top: '5vh', right: '5vh', display: 'flex', gap: '1rem', placeItems: 'center' }),
		new NineSlice(assets.ui.frameornate, 8, 4),
		steps,
	)
		.withChildren((root) => {
			root.spawn(UIElement.fromImage(assets.ui.boots, 7))
			root.spawn(new UIElement({ margin: '0.5rem' })).spawn(steps.getTextElement())
		})
}

export const stepsQuery = ecs.query.pick(StepsUi)
export const updateSteps = (stepsNb: number) => {
	for (const [steps] of stepsQuery.getAll()) {
		save.steps += stepsNb
		steps.update()
	}
}
