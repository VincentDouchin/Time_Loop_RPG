import { easing } from 'ts-easing'
import { stepsQuery } from './overworldUi'
import { DecidingDirection } from './navigation'
import { assets, despawnEntities, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { mainCameraQuery } from '@/lib/camera'
import { FullScreenShader, Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { ApocalypseShader } from '@/shaders/ApocalypseShader'
import { Player } from '@/genericComponents/components'
import { gameOver, save } from '@/save/saveData'
import { sleep } from '@/utils/timing'

@Component(ecs)
export class Apocalypse {}
@Component(ecs)
export class Explosion {}
@Component(ecs)
export class Portal {}

const portalQuery = ecs.query.pick(Portal)
const explosionQuery = ecs.query.pick(Explosion)
const apocalypseQuery = ecs.query.pick(Apocalypse)
const playerPositionQuery = ecs.query.pick(Entity, Position, TextureAtlas).with(Player)

const meteor = () => new Promise<void>((resolve) => {
	const bundle = TextureAtlas.single(assets.animations['explosion-4'], 300)
	const [sprite, animator, atlas] = bundle
	sprite.setScale(1)
	animator.stop()
	const pos = new Position(0, 100)
	ecs.spawn(...bundle, pos, new Apocalypse())
	ecs.spawn(new FullScreenShader(), new ApocalypseShader())
	new Tween(1000)
		.easing(easing.inQuad)
		.onUpdate(y => pos.y = Math.floor(y / 20) * 20, 100, 0)
		.onComplete(() => {
			animator.stopped = false
			atlas.playAnimation('default').then(() => {
				animator.stop()
				resolve()
			})
		})
})
const teleportPlayer = () => new Promise<void>((resolve) => {
	for (const [player, pos, atlas] of playerPositionQuery.getAll()) {
		player.removeComponent(DecidingDirection)
		const bundle = TextureAtlas.bundle<'start' | 'middle' | 'end'>({
			states: {
				start: assets.animations.portalStart,
				middle: assets.animations.portalMiddle,
				end: assets.animations.portalEnd,
			},
			speed: { default: 100 },
		}, 'start')
		const portal = ecs.spawn(...bundle, new Position(pos.x, pos.y + 8), new Portal())
		bundle[2].playAnimation('start').then(() => {
			bundle[2].state = 'middle'
			atlas.state = 'walk'
			atlas.directionY = 'up'
			new Tween(1000)
				.onUpdate(y => pos.y = y, pos.y, pos.y + 8)
				.onComplete(() => {
					player.removeComponent(Sprite)
					bundle[2].playAnimation('end').then(() => {
						portal.despawn()
						resolve()
					})
				})
		})
	}
})
const apocalypseState = ecs.state()
	.onEnter(() => {
		teleportPlayer().then(() => meteor().then(() => sleep(4000).then(() => apocalypseState.disable())))
	})
	.onUpdate(() => {
		if (explosionQuery.size < 5 && portalQuery.size === 0 && apocalypseQuery.size === 1) {
			const explosionAnimation = [assets.animations['explosion-1'], assets.animations['explosion-6'], assets.animations['explosion-2']][Math.floor(Math.random() * 3)]
			const bundle = TextureAtlas.single(explosionAnimation, 300)
			const [_sprite, _animator, atlas] = bundle
			const camera = mainCameraQuery.extract()
			if (camera) {
				const dirX = Math.random() > 0.5 ? 1 : -1
				const dirY = Math.random() > 0.5 ? 1 : -1
				const explositon = ecs.spawn(...bundle, new Position(Math.random() * dirX * camera.right, Math.random() * dirY * camera.right))
				atlas.playAnimation('default').then(() => {
					explositon.despawn()
				})
			}
		}
	})
	.onExit(gameOver, despawnEntities(ApocalypseShader, Apocalypse, Explosion))

export const triggerApocalypse = () => {
	if (save.steps <= 0 && !apocalypseState.isActive && playerPositionQuery.size) {
		apocalypseState.enable()
	}
}
