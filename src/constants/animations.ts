export type AnimationSpeed = { 'default': number } & Record< string, number>
interface AnimationData {
	size: number
	speed: AnimationSpeed
}
export const animations: Partial<Record<characters, AnimationData >> & Record<'default', AnimationData> = {
	default: {
		size: 32,
		speed: {
			default: 100,
			idle: 300,
			die: 100,
		},

	},
	howard: {
		size: 32,
		speed: {
			default: 200,
			idle: 200,
			die: 200,
		},

	},
	angelOfDeath: {
		size: 32,
		speed: {
			default: 200,
		},
	},
}
