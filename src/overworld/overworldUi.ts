import { assets, ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { NineSlice } from '@/ui/NineSlice'
import { TextElement, UIElement } from '@/ui/UiElement'

@Component(ecs)
export class StepsUi {
	text?: TextElement
	constructor(public amount: number) {}
	getTextElement() {
		this.text = new TextElement(String(this.amount), 2)
		return this.text
	}

	update(nb: number) {
		this.amount += nb
		if (this.text) {
			this.text.textContent = String(this.amount)
		}
	}
}

export const spawnStepsUi = () => {
	const steps = new StepsUi(5)
	ecs.spawn(
		new UIElement({ position: 'absolute', top: '5vh', right: '5vh', display: 'flex', gap: '1rem', placeItems: 'center' }),
		new NineSlice(assets.ui.frameBig.path, 8, 2),
		steps,
	)
		.withChildren((root) => {
			root.spawn(UIElement.fromImage(assets.ui.boots, 7))
			root.spawn(new UIElement({ margin: '2rem' })).spawn(steps.getTextElement())
		})
}

export const stepsQuery = ecs.query.pick(StepsUi)
export const updateSteps = (stepsNb: number) => {
	for (const [steps] of stepsQuery.getAll()) {
		steps.update(stepsNb)
	}
}
