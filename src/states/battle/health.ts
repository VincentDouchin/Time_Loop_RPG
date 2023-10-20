import type { PlayerData } from '@/constants/players'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { save } from '@/save/saveData'
import type { UIElement } from '@/ui/UiElement'

@Component(ecs)
export class Health {
	currentHealth: number
	constructor(public maxHealth: number, currentHealth?: number | null, public label?: string) {
		this.currentHealth = currentHealth ?? maxHealth
	}

	static fromPlayerData(playerData: PlayerData) {
		return new Health(playerData.health, playerData.currentHealth, playerData.name)
	}
}

@Component(ecs)
export class HealthDisplay {
	constructor(public inner: UIElement) {}
}

const healthQuery = ecs.query.pick(Health)
export const savePlayerHealth = () => {
	for (const [health] of healthQuery.getAll()) {
		if (health.label) {
			const playerData = save.players.find(player => player.name === health.label)
			if (playerData && playerData.currentHealth !== health.currentHealth) {
				playerData.currentHealth = health.currentHealth
			}
		}
	}
}
