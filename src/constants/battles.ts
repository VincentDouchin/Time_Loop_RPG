import { type Enemy, enemies } from './enemies'
import { showEndOfDemo } from '@/states/dungeon/endOfDemo'
import { giveMoney } from '@/utils/battleHelpers'

export interface BattleData {
	enemies: readonly Enemy[]
	background: number
	onExit?: () => void
	cutscene?: () => void
}

export const battles = {
	Bandits: {
		enemies: [enemies.bandit, enemies.banditLeader, enemies.bandit],
		background: 0,
		onExit: giveMoney(20),
	},
	BossBattleIntro: {
		enemies: [enemies.angelOfDeath],
		background: 2,
		onExit: showEndOfDemo,
	},
	ForestAnimals: {
		enemies: [enemies.bat, enemies.wolf, enemies.bat],
		background: 1,
		onExit: giveMoney(2),
	},
	Bear: {
		enemies: [enemies.bear],
		background: 1,
		onExit: giveMoney(3),
	},
} as const satisfies Record<string, BattleData>
