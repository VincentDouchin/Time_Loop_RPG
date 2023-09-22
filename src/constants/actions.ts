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
export interface BattleAction {
	label: string
	target: TargetType
	targetAmount: number
	power: number
	type: ActionType
	animation: string
	weapon?: string
}
export enum ActionSelector {
	PlayerMenu,
	EnemyAuto,
}
export enum TargetSelector {
	PlayerTargetMenu,
	EnemyAuto,
}
export const PlayerActions: Record<string, BattleAction> = {
	attack: {
		label: 'Attack',
		target: TargetType.Others,
		power: 1,
		targetAmount: 1,
		type: ActionType.Damage,
		animation: 'attack',
	},
	flee: {
		label: 'Flee',
		target: TargetType.Self,
		power: 0,
		targetAmount: 0,
		type: ActionType.Flee,
		animation: 'walk',
	},
}

export const singleEnemyAttack = (animation = 'attack', power = 1) => ({
	label: 'Attack',
	target: TargetType.Others,
	power,
	targetAmount: 1,
	type: ActionType.Damage,
	animation,
})
export const defaultEnemyAction = {
	label: 'Attack',
	target: TargetType.Others,
	power: 1,
	targetAmount: 1,
	type: ActionType.Damage,
	animation: 'attack',
}
