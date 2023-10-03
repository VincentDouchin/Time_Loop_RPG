import { type BattleAction, singleEnemyAttack } from './actions'
import { ecs } from '@/globals/init'
import type { Class } from '@/lib/ECS'
import { Component } from '@/lib/ECS'

export interface Enemy<K extends keyof characterAnimations> {
	atlas: K
	actions: readonly BattleAction<K>[]
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
		actions: [singleEnemyAttack('attack')],
	},
	bat: {
		atlas: 'bat',
		actions: [singleEnemyAttack('attack')],
	},
	wolf: {
		atlas: 'wolf',
		actions: [singleEnemyAttack('attack')],
	},
} as const satisfies { [k in keyof characterAnimations]?: Enemy<k> }
