import { type Enemy, enemies } from './enemies'

export interface BattleData {
	enemies: readonly Enemy[]
	background: number
}

export const battles = {
	Bandits: {
		enemies: [enemies.bandit, enemies.banditLeader, enemies.bandit],
		background: 0,
	},
	BossBattleIntro: {
		enemies: [enemies.angelOfDeath],
		background: 1,
	},
	ForestAnimals: {
		enemies: [enemies.bat, enemies.wolf, enemies.bat],
		background: 1,
	},
} as const satisfies Record<string, BattleData>
