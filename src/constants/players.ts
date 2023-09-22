export interface PlayerData {
	animations: characters
	health: number
	currentHealth: null | number
}

export const players = {
	paladin: {
		animations: 'paladin',
		health: 20,
		currentHealth: null,
	},

} as const satisfies Record<string, PlayerData>
