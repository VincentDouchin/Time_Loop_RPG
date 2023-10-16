import { type BattleAction, singleEnemyAttack } from './actions'
import { BanditLeader } from '@/states/battle/enemyTags'
import type { Class } from '@/lib/ECS'

export interface Enemy<K extends keyof characterAnimations = keyof characterAnimations > {
	atlas: K
	actions: readonly BattleAction<K>[]
	bundle?: () => Array<InstanceType<Class>>
}

export const enemies = {
	bandit: {
		atlas: 'bandit',
		actions: [singleEnemyAttack('dagger')],
	},
	banditLeader: {
		atlas: 'banditLeader',
		actions: [singleEnemyAttack('dagger')],
		bundle: () => [new BanditLeader()],
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
