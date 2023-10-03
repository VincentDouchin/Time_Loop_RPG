export type playerNames = 'paladin' & characters
export interface PlayerData {
	name: playerNames
	health: number
	currentHealth: null | number
}

export const players = {
	paladin: {
		name: 'paladin',
		health: 20,
		currentHealth: null,
	},

} as const satisfies Record<playerNames, PlayerData>
