import { Health } from './health'
import type { characterStates } from '@/character/spawnOverworldCharacter'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { textureAtlasBundle } from '@/lib/bundles'
import { Interactable } from '@/lib/interactions'
import { type TextureAltasStates, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { NineSlice } from '@/ui/NineSlice'
import { TextElement, UIElement } from '@/ui/UiElement'

@Component(ecs)
export class BattlerMenu {}

const spawnBattleUi = () => {
	ecs.spawn(
		new UIElement({ width: '50%', height: '50px', alignSelf: 'end', justifySelf: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr' }),
		new NineSlice(assets.ui.frameBig.path, 16, 2),
		new BattlerMenu(),
	)
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
	return [...bundle, position, new Battler()]
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

const playerQuery = ecs.query.pick(Player, Health, TextureAtlas<characterStates>).with(Battler).with(CurrentTurn)
const enemyQuery = ecs.query.pick(Enemy, Health).with(Battler)
const battlerMenuQuery = ecs.query.with(BattlerMenu)
const playerAttackActionQuery = ecs.query.pick(Interactable).with(PlayerAttackAction)

export const battleTurn = () => {
	if (playerQuery.size && !playerAttackActionQuery.size) {
		for (const [battlerMenuEntity] of battlerMenuQuery.getEntities()) {
			battlerMenuEntity.spawn(
				new UIElement(),
				new PlayerAttackAction(),
				new Interactable(),
			).spawn(
				new TextElement('attack'),
			)
		}
	}
}

const nextTurnQuery = ecs.query.with(Battler).without(Played).without(CurrentTurn)
// const decideTurn = ()=>{
// 	if (nextTurnQuery.size)

// }
const battlerQuery = ecs.query.with(Battler)
// const resetPlayed = ()=>{
// 	if (battlerQuery.getEntities().every(([entity])=>entity.getComponent(Played))){
// 		for (const [entity] of battlerQuery.getEntities()){
// 			entity.removeComponent(Played)

// 		}
// 	}
// }

export const takeAction = () => {
	for (const [interactable] of playerAttackActionQuery.getAll()) {
		if (interactable.justPressed && playerQuery.size) {
			const enemy = enemyQuery.getSingle()
			if (enemy) {
				const [_, enemyHealth] = enemy
				enemyHealth.currentHealth--
				for (const [playerEntity, _player, _health, textureAtlas] of playerQuery.getEntities()) {
					playerEntity.removeComponent(CurrentTurn)
					textureAtlas.playAnimation('attack').then(() => {
						textureAtlas.state = 'idle'
					})
				}
			}
		}
	}
}
