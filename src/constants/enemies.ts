import { type BattleAction, singleEnemyAttack } from './actions'

export interface Enemy {
	atlas: characters
	actions: readonly BattleAction[]
}
export const enemies = {
	bandit: {
		atlas: 'bandit',
		actions: [singleEnemyAttack('dagger')],
	},
	banditLeader: {
		atlas: 'banditLeader',
		actions: [singleEnemyAttack('dagger')],
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
