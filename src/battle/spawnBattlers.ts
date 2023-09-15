import { ActionSelector, Battler, BattlerMenu, BattlerType, EnemyActions, PlayerActions, TargetSelector, selectAction, selectNextBattler, selectTargets, takeAction } from './battleActions'
import { Health } from './health'
import { currentLevel } from './spawnBattleBackground'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { textureAtlasBundle } from '@/lib/bundles'
import { Interactable } from '@/lib/interactions'
import { type TextureAltasStates, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { overworldState } from '@/main'
import { OutlineShader } from '@/shaders/OutlineShader'
import { NineSlice } from '@/ui/NineSlice'
import { TextElement, UIElement } from '@/ui/UiElement'
import { Selected } from '@/ui/menu'
import { sleep } from '@/utils/timing'

@Component(ecs)
export class Player {}

const spawnBattleUi = () => {
	ecs.spawn(
		new UIElement({ width: '50%', height: '50px', alignSelf: 'end', justifySelf: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center' }),
		new NineSlice(assets.ui.frameBig.path, 16, 2),
		new BattlerMenu(),
	)
}
const battlerSpriteBundle = (side: 'left' | 'right', textureAtlas: TextureAltasStates<'walk' | 'idle'>, index: number = 0, length: number = 1) => {
	const bundle = textureAtlasBundle<'walk' | 'idle'>(textureAtlas, 'walk', side, 'down')
	const [sprite, _, atlas] = bundle
	sprite.anchor(0, 0).setScale(1).setRenderOrder(10)

	const direction = side === 'right' ? -1 : 1
	const width = sprite.scaledDimensions.x / 2
	const edge = (currentLevel.pxWid / 2 - (width / 2)) * direction
	const position = new Position(edge, index * width - width * (length - 1) / 2)
	new Tween(1500)
		.onUpdate(x => position.x = x, edge, edge - width * direction)
		.onComplete(() => atlas.state = 'idle')
	return [...bundle, position, new Interactable()]
}

export const spawnBattlers = (battle: Entity) => {
	const bundle = battlerSpriteBundle('right', assets.characters.paladin)
	const player = battle.spawn(...bundle, new Health(20), new Player())
	new Tween(2000)
		.onComplete(() => player.addComponent(new Battler(BattlerType.Player, [PlayerActions.attack, PlayerActions.flee], ActionSelector.PlayerMenu, TargetSelector.PlayerTargetMenu)))

	const enemies = [
		assets.characters.paladin,
	]
	for (let i = 0; i < enemies.length; i++) {
		const bundle = battlerSpriteBundle('left', enemies[i], i, enemies.length)
		const enemy = battle.spawn(...bundle, new Health(2))
		new Tween(2000)
			.onComplete(() => enemy.addComponent(new Battler(BattlerType.Enemy, [EnemyActions.attack], ActionSelector.EnemyAuto, TargetSelector.EnemyAuto)))
	}
	spawnBattleUi()
}
const battlersQuery = ecs.query.pick(Entity, Battler)

export const battleTurn = () => {
	// !Select next turn
	if (battlersQuery.toArray().every(([_, battler]) => !battler.currentTurn)) {
		for (const [_, battler] of battlersQuery.getAll()) {
			if (
				battler === selectNextBattler(battlersQuery.toArray()
					.filter(([_, battler]) => !battler.finishedTurn)
					.map(([_, battler]) => battler))
			) {
				battler.currentTurn = true
			}
		}
	}
	if (battlersQuery.toArray().every(([_, battler]) => battler.finishedTurn)) {
		for (const [_, battler] of battlersQuery.getAll()) {
			battler.reset()
		}
	}
	for (const [_, battler] of battlersQuery.getAll()) {
		if (battler.currentTurn) {
			if (!battler.currentAction) {
				selectAction(battler)
			} else if (!battler.hasSelectedTargets()) {
				selectTargets(battler)
			} else if (!battler.takingAction) {
				takeAction(battler)
			}
		}
	}
}

const deadBattlersQuery = ecs.query.pick(Entity, Health, TextureAtlas<'die'>).with(Battler)

export const removeDeadBattlers = () => {
	for (const [entity, health, atlas] of deadBattlersQuery.getAll()) {
		if (health.currentHealth === 0) {
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
const battlerMenuQuery = ecs.query.pick(Entity).with(BattlerMenu)
const winOrLoseBundle = () => [new UIElement({ position: 'absolute', placeSelf: 'center', width: 'fit-content', padding: '5%', color: 'black', placeContent: 'center', display: 'grid', fontSize: '3em' }), new NineSlice(assets.ui.framedisplay.path, 8, 3), new WinOrLose()]
const despawnBattleMenu = () => {
	for (const [entity] of battlerMenuQuery.getAll()) {
		entity.despawn()
	}
}
export const winOrLose = () => {
	if (winOrLoseUiQuery.size === 0) {
		if (playerQuery.size === 0 && notPlayerQuery.size > 0) {
			ecs.spawn(...winOrLoseBundle()).spawn(new TextElement('Game Over'))
			despawnBattleMenu()
		}
		if (notPlayerQuery.size === 0 && playerQuery.size > 0) {
			ecs.spawn(...winOrLoseBundle()).spawn(new TextElement('You won!'))
			despawnBattleMenu()
			sleep(3000).then(() => overworldState.enable())
		}
	}
}
