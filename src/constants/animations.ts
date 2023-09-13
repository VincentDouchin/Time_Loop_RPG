export type characterNames = 'paladin'
export type AnimationSpeed = { 'default': number } & Record< string, number>
export const animations: Record<characterNames, { size: number; speed: AnimationSpeed }> = {
	paladin: {
		size: 32,
		speed: {
			default: 100,
			idle: 200,
			die: 200,
		},

	},
}
