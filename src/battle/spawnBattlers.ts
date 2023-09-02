import { Health } from './health'
import type { characterStates } from '@/character/spawnOverworldCharacter'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { textureAtlasBundle } from '@/lib/bundles'
import { Interactable, InteractableType } from '@/lib/interactions'
import { type TextureAltasStates, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { OutlineShader } from '@/shaders/OutlineShader'
import { NineSlice } from '@/ui/NineSlice'
import { TextElement, UIElement } from '@/ui/UiElement'
import { Menu, Selected } from '@/ui/menu'

@Component(ecs)
export class BattlerMenu {}
@Component(ecs)
export class EnemySelectMenu {}

const spawnBattleUi = () => {
	const battlerMenuEntity = ecs.spawn(
		new UIElement({ width: '50%', height: '50px', alignSelf: 'end', justifySelf: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center' }),
		new NineSlice(assets.ui.frameBig.path, 16, 2),
		new BattlerMenu(),
	)
	const attack = battlerMenuEntity.spawn(
		new UIElement(),
		new Interactable(InteractableType.PlayerAttack),
	)
	attack.spawn(new TextElement('Attack'))
	const flee = battlerMenuEntity.spawn(
		new UIElement(),
		new Interactable(InteractableType.PlayerFlee),
	)
	flee.spawn(new TextElement('Flee'))
	battlerMenuEntity.addComponent(Menu.fromRow(attack, flee))
}

const battlerSpriteBundle = (side: 'left' | 'right', textureAtlas: TextureAltasStates<'run' | 'idle'>, index: number = 0, length: number = 1) => {
	const bundle = textureAtlasBundle<'run' | 'idle'>(textureAtlas, 'run', 200)
	const [sprite, _, atlas] = bundle
	sprite.setScale(1.5)
	sprite.flip = side === 'right'
	const direction = side === 'left' ? -1 : 1
	const edge = assets.levels.battle.levels[0].pxWid / 2 * direction
	const y = 1 + index
	const position = new Position(edge, y * 50 - length * 25)

	new Tween(1500)
		.onUpdate(x => position.x = x, edge, edge + 50 * -direction)
		.onComplete(() => atlas.state = 'idle')
	return [...bundle, position, new Battler(), new Interactable(InteractableType.Battler)]
}
@Component(ecs)
export class Player { }
@Component(ecs)
export class Enemy { }
@Component(ecs)
export class Battler {}
@Component(ecs)
export class Played {}
@Component(ecs)
export class CurrentTurn {}
@Component(ecs)
export class TargetToSelect {}
@Component(ecs)
export class Target {}

export const spawnBattlers = () => {
	const bundle = battlerSpriteBundle('left', assets.characters.MiniPrinceMan)
	ecs.spawn(...bundle, new Player(), new CurrentTurn(), new Health(10))

	const enemies = [assets.characters.MiniGoblin, assets.characters.MiniGoblinThief, assets.characters.MiniGoblin]
	for (let i = 0; i < enemies.length; i++) {
		const bundle = battlerSpriteBundle('right', enemies[i], i, enemies.length)
		ecs.spawn(...bundle, new Enemy(), new Health(2))
	}
	spawnBattleUi()
}

@Component(ecs)
export class PlayerAttackAction {}

const enemyToTakeTurnQuery = ecs.query.pick(Entity).with(Enemy).without(CurrentTurn, Played)

const targetQuery = ecs.query.pick(TextureAtlas<'hit' | 'idle'>, Health).with(Target)
const whoseTurnQuery = ecs.query.pick(Entity, TextureAtlas<characterStates>).with(CurrentTurn).without(Played)
export const takeAction = () => {
	for (const [entity, atlas] of whoseTurnQuery.getAll()) {
		if (targetQuery.size) {
			atlas.playAnimation('attack').then(() => {
				entity.addComponent(new Played())
				atlas.state = 'idle'
				for (const [targetAtlas, targetHealth] of targetQuery.getAll()) {
					targetHealth.currentHealth--
					targetAtlas.playAnimation('hit').then(() => targetAtlas.state = 'idle')
				}
				entity.removeComponent(CurrentTurn)
			})
		}
	}
}

const nextTurnQuery = ecs.query.without(Played, CurrentTurn)
const currentTurnQuery = ecs.query.pick(Entity).with(CurrentTurn)
export const battleTurn = () => {
	if (nextTurnQuery.size === 0 && !currentTurnQuery.size) {
		const enemy = enemyToTakeTurnQuery.extract()
		if (enemy) {
			enemy.addComponent(new CurrentTurn())
		}
	}
}

const playerQuery = ecs.query.pick(Entity).with(Player, Health)
const enemyQuery = ecs.query.pick(Entity).with(Enemy, Health)
const targetToSelect = ecs.query.with(TargetToSelect)
const actionsQuery = ecs.query.pick(Entity, Interactable)
const actionMenuQuery = ecs.query.pick(Menu).with(BattlerMenu)
const enemySelectMenuQuery = ecs.query.pick(Entity).with(EnemySelectMenu)
export const selectTarget = () => {
	for (const [entity, interactable] of actionsQuery.getAll()) {
		if (interactable.justPressed && interactable.type === InteractableType.PlayerAttack) {
			const actionMenu = actionMenuQuery.extract()
			if (actionMenu) {
				actionMenu.active = false
				ecs.spawn(
					Menu.fromColumn(...Array.from(enemyQuery.getAll()).flat()),
					new EnemySelectMenu(),
				)
			}
		}
		if (interactable.justPressed && interactable.type === InteractableType.Battler) {
			entity.addComponent(new Target())
			const enemySelectMenu = enemySelectMenuQuery.extract()
			if (enemySelectMenu) {
				enemySelectMenu.despawn()
			}
		}
	}
}
const targetedEnemies = ecs.query.pick(Entity).with(Enemy).added(Selected)
const untargetedEnemies = ecs.query.pick(Entity).with(Enemy).removed(Selected)
export const selectEnemy = () => {
	for (const [enemy] of untargetedEnemies.getAll()) {
		enemy.removeComponent(OutlineShader)
	}
	for (const [enemy] of targetedEnemies.getAll()) {
		enemy.addComponent(new OutlineShader())
	}
}
