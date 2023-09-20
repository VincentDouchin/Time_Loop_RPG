export interface Enemy {
	atlas: characters
}
export const enemies = {
	bandit: {
		atlas: 'bandit',
	},
	banditLeader: {
		atlas: 'bandit2',
	},
	angelOfDeath: {
		atlas: 'angelOfDeath',
	},
} as const satisfies Record<string, Enemy>
