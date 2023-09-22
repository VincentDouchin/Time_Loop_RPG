import type { PlayerData } from '@/constants/players'
import { assets, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { save } from '@/save/saveData'
import { UIElement } from '@/ui/UiElement'

@Component(ecs)
export class Health {
	currentHealth: number
	constructor(public maxHealth: number, currentHealth?: number | null, public label?: string) {
		this.currentHealth = currentHealth ?? maxHealth
	}

	static fromPlayerData(playerData: PlayerData) {
		return new Health(playerData.health, playerData.currentHealth, playerData.animations)
	}
}

@Component(ecs)
export class HealthDisplay {
	constructor(public inner: UIElement) {}
}

const healthDisplayToCreate = ecs.query.pick(Entity, Health).added(Health)
export const displayHealth = () => {
	for (const [entity] of healthDisplayToCreate.getAll()) {
		const inner = UIElement.fromImage(assets.ui.healthfull, 5)

		entity
			.spawn(...UIElement
				.fromImage(assets.ui.healthbar, 5)
				.withWorldPosition(0, 8),
			)
			.spawn(new UIElement({ margin: '5px' }))
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

const healthQuery = ecs.query.pick(Health)
export const savePlayerHealth = () => {
	for (const [health] of healthQuery.getAll()) {
		if (health.label) {
			const playerData = save.players.find(player => player.animations === health.label)
			if (playerData && playerData.currentHealth !== health.currentHealth) {
				playerData.currentHealth = health.currentHealth
			}
		}
	}
}
