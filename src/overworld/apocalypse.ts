import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { easing } from 'ts-easing'
import { Player } from '@/genericComponents/components'
import { assets, despawnEntities, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { mainCameraQuery } from '@/lib/camera'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { gameOver, save } from '@/save/saveData'
import { ApocalypseShader } from '@/shaders/ApocalypseShader'
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
const composerQuery = ecs.query.pick(Entity).with(EffectComposer)
const meteor = () => new Promise<void>((resolve) => {
	const bundle = TextureAtlas.single(assets.animations['explosion-4'], 300)
	const [sprite, animator, atlas] = bundle
	sprite.setScale(1)
	animator.stop()
	composerQuery.extract()?.addComponent(new ApocalypseShader())
	const pos = new Position(0, 100)
	ecs.spawn(...bundle, pos, new Apocalypse())
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
const teleportPlayer = async () => {
	save.lastNodeUUID = null
	for (const [player, pos, atlas] of playerPositionQuery.getAll()) {
		const bundle = TextureAtlas.bundle<'start' | 'middle' | 'end'>({
			states: {
				start: assets.animations.portalStart,
				middle: assets.animations.portalMiddle,
				end: assets.animations.portalEnd,
			},
			speed: { default: 100 },
		}, 'start')
		const portal = ecs.spawn(...bundle, new Position(pos.x, pos.y + 8), new Portal())
		await bundle[2].playAnimation('start')
		bundle[2].state = 'middle'
		atlas.state = 'walk'
		atlas.directionY = 'up'
		await new Tween(1000).onUpdate(y => pos.y = y, pos.y, pos.y + 8).start()

		player.removeComponent(Sprite)
		await bundle[2].playAnimation('end')
		portal.despawn()
	}
}
const apocalypseState = ecs.state()
	.onEnter(() => {
		teleportPlayer().then(() => meteor().then(() => sleep(1000).then(() => apocalypseState.disable())))
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
	.onExit(gameOver, despawnEntities(Apocalypse, Explosion), () => {
		composerQuery.extract()?.removeComponent(ApocalypseShader)
	})

export const triggerApocalypse = () => {
	if (save.steps <= 0 && !apocalypseState.isActive && playerPositionQuery.size) {
		apocalypseState.enable()
	}
}
