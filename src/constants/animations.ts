export type characterNames = 'paladin' | 'howard'
export type AnimationSpeed = { 'default': number } & Record< string, number>
interface AnimationData {
	size: number
	speed: AnimationSpeed
}
export const animations: Partial<Record<characterNames, AnimationData >> & Record<'default', AnimationData> = {
	default: {
		size: 32,
		speed: {
			default: 100,
			idle: 200,
			die: 200,
		},

	},
	howard: {
		size: 32,
		speed: {
			default: 100,
			idle: 200,
			die: 200,
		},

	},
}
