import { type BattleAction, singleEnemyAttack } from './actions'
import { ecs } from '@/globals/init'
import type { Class } from '@/lib/ECS'
import { Component } from '@/lib/ECS'

export interface Enemy {
	atlas: characters
	actions: readonly BattleAction[]
	additionalComponents?: readonly (() => InstanceType<Class>)[]
}
@Component(ecs)
export class BanditLeader {}

export const enemies = {
	bandit: {
		atlas: 'bandit',
		actions: [singleEnemyAttack('dagger')],
	},
	banditLeader: {
		atlas: 'banditLeader',
		actions: [singleEnemyAttack('dagger')],
		additionalComponents: [() => new BanditLeader()],
	},
	angelOfDeath: {
		atlas: 'angelOfDeath',
		actions: [singleEnemyAttack()],
	},
	bat: {
		atlas: 'bat',
		actions: [singleEnemyAttack()],
	},
	wolf: {
		atlas: 'wolf',
		actions: [singleEnemyAttack()],
	},
} as const satisfies Record<string, Enemy>
