import { actionMenu } from './battleUi'
import { Health } from './health'
import type { BattleAction, BattlerType } from '@/constants/actions'
import { ActionSelector, TargetSelector, TargetType } from '@/constants/actions'
import { DialogOption } from '@/dungeon/NPC'
import { assets, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Interactable } from '@/lib/interactions'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { getMenuInputMap } from '@/menus/menuInputs'
import { ColorShader } from '@/shaders/ColorShader'
import { Menu, Selected } from '@/ui/menu'

@Component(ecs)
export class BattlerMenu {}
@Component(ecs)
export class EnemySelectMenu {}

@Component(ecs)
export class PlayerActionItem {
	constructor(public action: BattleAction<any>) {}
}

@Component(ecs)
export class Battler {
	currentTurn = false
	finishedTurn = false
	takingAction = false
	targets: Entity[] = []
	currentAction: BattleAction<any> | null = null
	constructor(
		public type: BattlerType,
		public actions: readonly BattleAction<any>[],
		public actionSelector: ActionSelector,
		public targetSelector: TargetSelector,
	) {}

	reset() {
		this.currentTurn = false
		this.takingAction = false
		this.finishedTurn = false
		this.targets = []
		this.currentAction = null
	}

	get hasSelectedTargets() {
		return this.currentAction && (this.currentAction.targetAmount === this.targets.length)
	}

	get canSelectTarget() {
		return this.currentAction?.target && [TargetType.Others, TargetType.Same].includes(this.currentAction.target)
	}

	compareTo(battler: Battler) {
		if (this.currentAction) {
			switch (this.currentAction.target) {
			case TargetType.Self:{
				return this === battler
			}
			case TargetType.AllOthers:
			case TargetType.Others:{
				return this.type !== battler.type
			}
			case TargetType.AllSame:
			case TargetType.Same:{
				return this.type === battler.type
			}
			case TargetType.Any:
			case TargetType.All: {
				return true
			}
			}
		}
	}
}

const battlerMenuQuery = ecs.query.pick(Entity).with(BattlerMenu)
const playerActionItemQuery = ecs.query.pick(PlayerActionItem, Interactable)

export const selectNextBattler = (battlers: Battler[]) => {
	return battlers[0]
}
const dialogOptionQuery = ecs.query.with(DialogOption)
export const selectAction = (battler: Battler) => {
	switch (battler.actionSelector) {
	case ActionSelector.PlayerMenu:{
		const battlerMenu = battlerMenuQuery.extract()
		const existingMenu = battlerMenu?.getComponent(Menu)
		if (!battlerMenu && dialogOptionQuery.size === 0) {
			ecs.spawn(actionMenu(battler.actions))
		}
		if (existingMenu) {
			existingMenu.active = true
		}
		for (const [item, interactable] of playerActionItemQuery.getAll()) {
			if (interactable.justPressed) {
				battler.currentAction = item.action
				const battlerMenu = battlerMenuQuery.extract()
				const existingMenu = battlerMenu?.getComponent(Menu)
				if (existingMenu) {
					existingMenu.active = false
				}
			}
		}
	};break
	case ActionSelector.EnemyAuto:{
		battler.currentAction = battler.actions[0]
	};break
	}
}

const battlerQuery = ecs.query.pick(Entity, Battler)
const enemySelectMenuQuery = ecs.query.pick(Entity).with(EnemySelectMenu)
const possibleTargetsQuery = ecs.query.pick(Entity, Interactable).with(Battler, Selected)
export const selectTargets = (battler: Battler) => {
	const potentialTargets = battlerQuery.toArray()
		.filter(([_, otherBattler]) => battler.compareTo(otherBattler))
		.map(([entity]) => entity)

	if (battler.canSelectTarget) {
		switch (battler.targetSelector) {
		case TargetSelector.PlayerTargetMenu:{
			const enemySelectMenu = enemySelectMenuQuery.extract()
			if (!enemySelectMenu && !battler.hasSelectedTargets) {
				ecs.spawn(new Menu(potentialTargets), new EnemySelectMenu(), getMenuInputMap())
			}
			for (const [entity, interactable] of possibleTargetsQuery.getAll()) {
				if (interactable.justPressed) {
					battler.targets.push(entity)
					entity.addComponent(new ColorShader([1, 1, 1, 0.8]))
					if (battler.hasSelectedTargets) {
						enemySelectMenu?.despawn()
					}
				}
			}
		};break
		case TargetSelector.EnemyAuto:{
			battler.targets.push(potentialTargets[Math.floor(Math.random() * potentialTargets.length)])
		};break
		}
	} else {
		battler.targets = potentialTargets
	}
}
const playEffect = async (parent: Entity, atlas: TextureAtlas<any>, effects: characterAnimations['battleEffects'][]): Promise<void> => {
	const effectsAtlas = TextureAtlas.bundle(assets.characters.battleEffects, effects[0], atlas.directionX, atlas.directionY)
	const effect = parent.spawn(new Position(), ...effectsAtlas)
	await effectsAtlas[2].playAnimation(...effects)
	effect.despawn()
}

const battlerToTakeActionOnQuery = ecs.query.pick(Entity, TextureAtlas, Health, Battler)
export const takeAction = (battlerTakingAction: Battler) => {
	battlerTakingAction.takingAction = true
	for (const [entity, atlas, _health, battler] of battlerToTakeActionOnQuery.getAll()) {
		if (battler === battlerTakingAction) {
			if (battler.currentAction?.selfEffects) {
				playEffect(entity, atlas, battler.currentAction.selfEffects)
			}
			atlas.playAnimation(...battler.currentAction!.animation).then(() => {
				for (const [enemyEntity, enemyAtlas, enemyHealth, _enemyBattler] of battlerToTakeActionOnQuery.getAll()) {
					if (battler.targets.includes(enemyEntity)) {
						// !DAMAGE ANIMATIONS
						(async () => {
							if (battler.currentAction?.targetEffects) {
								await playEffect(enemyEntity, enemyAtlas, battler.currentAction.targetEffects)
							}
							await enemyAtlas.playAnimation('dmg')
						})().then(() => {
							enemyHealth.currentHealth--
							battler.currentTurn = false
							battler.finishedTurn = true
							enemyEntity.removeComponent(ColorShader)
						})
					}
				}
			})
		}
	}
}
