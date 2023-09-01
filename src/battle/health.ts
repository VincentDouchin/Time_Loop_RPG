import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { UIElement } from '@/ui/UiElement'

@Component(ecs)
export class Health {
	currentHealth: number
	constructor(public maxHealth: number) {
		this.currentHealth = maxHealth
	}
}

@Component(ecs)
export class HealthDisplay {
	constructor(public inner: UIElement) {}
}

const healthDisplayToCreate = ecs.query.pick(Health).added(Health)
export const displayHealth = () => {
	for (const [entity] of healthDisplayToCreate.getEntities()) {
		const inner = UIElement.fromImage(assets.ui.healthfull, 3)

		entity
			.spawn(...UIElement
				.fromImage(assets.ui.healthbar, 3)
				.withWorldPosition(),
			)
			.spawn(new UIElement({ margin: '3px' }))
			.spawn(inner)
		entity.addComponent(new HealthDisplay(inner))
	}
}
const healthDisplayQuery = ecs.query.pick(HealthDisplay, Health)
export const updateHealthDisplay = () => {
	for (const [healthDisplay, health] of healthDisplayQuery.getAll()) {
		healthDisplay.inner.setStyle('width', `${Math.floor(health.currentHealth / health.maxHealth * 100)}%`)
	}
}
