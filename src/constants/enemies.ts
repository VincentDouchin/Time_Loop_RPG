import { type BattleAction, singleEnemyAttack } from './actions'
import { BanditLeader } from '@/states/battle/enemyTags'
import type { Class } from '@/lib/ECS'

export interface Enemy<K extends keyof characterAnimations = keyof characterAnimations > {
	atlas: K
	actions: readonly BattleAction<K>[]
	bundle?: () => Array<InstanceType<Class>>
	hp: number
}

export const enemies = {
	bandit: {
		atlas: 'bandit',
		actions: [singleEnemyAttack('dagger')],
		hp: 3,
	},
	banditLeader: {
		atlas: 'banditLeader',
		actions: [singleEnemyAttack('dagger')],
		bundle: () => [new BanditLeader()],
		hp: 5,
	},
	angelOfDeath: {
		atlas: 'angelOfDeath',
		actions: [singleEnemyAttack('attack')],
		hp: 10,
	},
	bat: {
		atlas: 'bat',
		actions: [singleEnemyAttack('attack')],
		hp: 2,
	},
	wolf: {
		atlas: 'wolf',
		actions: [singleEnemyAttack('attack')],
		hp: 3,
	},
} as const satisfies { [k in keyof characterAnimations]?: Enemy<k> }
