import { easing } from 'ts-easing'
import { stepsQuery } from './overworldUi'
import { assets, ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { FullScreenShader, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { ApocalypseShader } from '@/shaders/ApocalypseShader'
import { mainCameraQuery } from '@/lib/camera'

@Component(ecs)
export class Apocalypse {}
@Component(ecs)
export class Explosion {}
const explosionQuery = ecs.query.pick(Explosion)
const apocalypseQuery = ecs.query.pick(Apocalypse)
export const triggerApocalypse = () => {
	for (const [steps] of stepsQuery.getAll()) {
		if (steps.amount === 4) {
			if (apocalypseQuery.size === 0) {
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
						})
					})
			}
			if (explosionQuery.size < 5) {
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
		}
	}
}
