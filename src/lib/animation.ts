import { Component } from './ECS'
import { Animator, Sprite, TextureAtlas } from './sprite'
import { Timer, time } from './time'
import { ecs } from '@/globals/init'

const animateQuery = ecs.query.pick(Animator, Sprite, TextureAtlas)
export const animateSprites = () => {
	for (const [animator, sprite, atlas] of animateQuery.getAll()) {
		animator.tick(time.delta)
		animator.delay = atlas.currentSpeed
		if (animator.justFinished) {
			atlas.increment()
			sprite.composer.setInitialTexture(atlas.currentTexture)
		}
	}
}
