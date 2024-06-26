import { Battler, BattlerMenu, selectAction, selectNextBattler, selectTargets, takeAction } from './battleActions'
import { battleUi, displayHealth } from './battleUi'
import { Cutscene } from './cutscene'
import { Health } from './health'
import { ActionSelector, BattlerType, PlayerActions, TargetSelector } from '@/constants/actions'
import type { Enemy } from '@/constants/enemies'
import { Player } from '@/generic/components'
import type { battleRessources } from '@/globals/init'
import { assets, despawnEntities, ecs, overworldState } from '@/globals/init'
import type { System } from '@/lib/ECS'
import { Component, Entity } from '@/lib/ECS'
import { Interactable } from '@/lib/interactions'
import { type TextureAltasStates, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { gameOver, save, saveToLocalStorage } from '@/save/saveData'
import { OutlineShader } from '@/shaders/OutlineShader'
import { UIElement } from '@/ui/UiElement'
import { Selected } from '@/ui/menu'
import { NineSlice } from '@/ui/nineSliceUi'
import { sleep } from '@/utils/timing'

const battlerSpriteBundle = (side: 'left' | 'right', textureAtlas: TextureAltasStates<'walk' | 'idle'>, background: number, index: number = 0, length: number = 1) => {
	const bundle = TextureAtlas.bundle<'walk' | 'idle'>(textureAtlas, 'walk', side, 'down')
	const [sprite, _, atlas] = bundle
	sprite.setRenderOrder(10)

	const direction = side === 'right' ? -1 : 1
	const width = sprite.scaledDimensions.x
	const height = sprite.scaledDimensions.y / 2
	const edge = (assets.levels.minibattle.levels[background].pxWid / 2 - (width / 2)) * direction
	const position = new Position(edge, index * height - height * length / 2)
	new Tween(1500)
		.onUpdate(x => position.x = x, edge, edge - width * direction)
		.onComplete(() => atlas.state = 'idle')
	return [...bundle, position]
}

export const spawnBattlers = (battle: Entity, background: number, enemies: readonly Enemy[]) => {
	// ! PLAYER
	const playerData = save.players[0]
	const bundle = battlerSpriteBundle('right', assets.characters[playerData.name], background)
	const player = battle.spawn(...bundle, Health.fromPlayerData(playerData), new Player())
	sleep(2000).then(() => player.addComponent(new Battler(BattlerType.Player, PlayerActions[playerData.name], ActionSelector.PlayerMenu, TargetSelector.PlayerTargetMenu)))

	// !ENEMIES
	for (let i = 0; i < enemies.length; i++) {
		const enemyData = enemies[i]
		const bundle = battlerSpriteBundle('left', assets.characters[enemyData.atlas], background, i, enemies.length)
		const enemy = battle.spawn(...bundle, new Health(enemyData.hp), new Interactable(8))
		if (enemyData.bundle) {
			enemy.addComponent(...enemyData.bundle())
		}

		sleep(2000).then(() => {
			enemy.addChildren(displayHealth(enemy, { x: 0, y: -5 }))
			enemy.addComponent(new Battler(BattlerType.Enemy, enemyData.actions, ActionSelector.EnemyAuto, TargetSelector.EnemyAuto))
		})
	}
	battleUi(player)
}
const battlersQuery = ecs.query.pick(Battler)
const cutsceneQuery = ecs.query.with(Cutscene)
export const battleTurn = () => {
	if (cutsceneQuery.size === 0) {
		// !Select next turn
		if (battlersQuery.toArray().every(([battler]) => !battler.currentTurn)) {
			for (const [battler] of battlersQuery.getAll()) {
				if (
					battler === selectNextBattler(battlersQuery.toArray()
						.filter(([battler]) => !battler.finishedTurn)
						.map(([battler]) => battler))
				) {
					battler.currentTurn = true
				}
			}
		}
		if (battlersQuery.toArray().every(([battler]) => battler.finishedTurn)) {
			for (const [battler] of battlersQuery.getAll()) {
				battler.reset()
			}
		}
		for (const [battler] of battlersQuery.getAll()) {
			if (battler.currentTurn) {
				if (!battler.currentAction) {
					selectAction(battler)
				} else if (!battler.hasSelectedTargets) {
					selectTargets(battler)
				} else if (!battler.takingAction) {
					takeAction(battler)
				}
			}
		}
	}
}

const deadBattlersQuery = ecs.query.pick(Entity, Health, TextureAtlas<'die'>).with(Battler)

export const removeDeadBattlers = () => {
	for (const [entity, health, atlas] of deadBattlersQuery.getAll()) {
		if (health.currentHealth <= 0) {
			entity.removeComponent(Battler)
			atlas.playAnimation('die').then(() => {
				entity.despawn()
			})
		}
	}
}

const targetedEnemies = ecs.query.pick(Entity, Battler).added(Selected)
const untargetedEnemies = ecs.query.pick(Entity, Battler).removed(Selected)
export const outlineSelectedEnemy = () => {
	for (const [enemy] of untargetedEnemies.getAll()) {
		enemy.removeComponent(OutlineShader)
	}
	for (const [enemy] of targetedEnemies.getAll()) {
		enemy.addComponent(new OutlineShader())
	}
}
@Component(ecs)
export class WinOrLose {}

export const winOrLoseUiQuery = ecs.query.pick(Entity).with(WinOrLose)
const playerQuery = ecs.query.with(Player, Battler)
const notPlayerQuery = ecs.query.with(Battler).without(Player)
const winOrLoseBundle = () => [new UIElement({ position: 'absolute', placeSelf: 'center', width: 'fit-content', padding: '5%', color: 'black', placeContent: 'center', display: 'grid', fontSize: '3em' }), new NineSlice(assets.ui.frameornate, 8, 4), new WinOrLose()]
export const despawnBattleMenu = despawnEntities(BattlerMenu)

const healthRemovedComponent = ecs.query.removed(Health)
export const winOrLose: System<battleRessources> = (battle) => {
	if (healthRemovedComponent.size) {
		if (playerQuery.size === 0 && notPlayerQuery.size > 0) {
			ecs.spawn(...winOrLoseBundle()).spawn(UIElement.text('Game Over'))
			despawnBattleMenu()
			sleep(3000).then(() => {
				gameOver()
				overworldState.enable()
			})
		}
		if (notPlayerQuery.size === 0 && playerQuery.size > 0) {
			ecs.spawn(...winOrLoseBundle()).spawn(UIElement.text('You won!'))
			despawnBattleMenu()
			if (battle.onExit) {
				battle.onExit()
			}
			sleep(3000).then(() => {
				overworldState.enable()
				saveToLocalStorage()
			})
		}
	}
}
