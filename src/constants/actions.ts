import type { playerNames } from './players'

export enum BattlerType {
	Player,
	Enemy,
}
export enum TargetType {
	Self,
	Others,
	Same,
	AllOthers,
	AllSame,
	All,
	Any,
}
export enum ActionType {
	Damage,
	Heal,
	Flee,
}
export interface BattleAction<K extends keyof characterAnimations> {
	label: string
	target: TargetType
	targetAmount: number
	power: number
	type: ActionType
	animation: characterAnimations[K][]
	weapon?: string
	selfEffects?: characterAnimations['battleEffects'][]

}
export enum ActionSelector {
	PlayerMenu,
	EnemyAuto,
}
export enum TargetSelector {
	PlayerTargetMenu,
	EnemyAuto,
}
export const PlayerActions: { [k in playerNames]: BattleAction<k>[] } = {
	paladin: [
		{
			label: 'Attack',
			target: TargetType.Others,
			power: 1,
			targetAmount: 1,
			type: ActionType.Damage,
			animation: ['attack'],
		},
		{
			label: 'Blades',
			target: TargetType.Others,
			power: 1,
			targetAmount: 1,
			type: ActionType.Damage,
			animation: ['dictum'],
			selfEffects: ['blades-start', 'blades-middle', 'blades-middle', 'blades-end'],
		},
	],
}

export const singleEnemyAttack = <A extends string>(animation: A, power = 1) => ({
	label: 'Attack',
	target: TargetType.Others,
	power,
	targetAmount: 1,
	type: ActionType.Damage,
	animation: [animation],
})
