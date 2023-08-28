import { Component } from './ECS'
import { Sprite, TextureAtlas } from './sprite'
import { Timer, time } from './time'
import { ecs } from '@/globals/init'

@Component(ecs)
export class Animator extends Timer {

}

const animateQuery = ecs.query.pick(Animator, Sprite, TextureAtlas)
export const animateSprites = () => {
	for (const [animator, sprite, atlas] of animateQuery.getAll()) {
		animator.tick(time.delta)
		if (animator.justFinished) {
			atlas.increment()
			sprite.composer.setInitialTexture(atlas.currentTexture)
		}
	}
}
