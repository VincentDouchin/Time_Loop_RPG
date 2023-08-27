import { Component } from './ECS'
import { TextureAtlasSprite } from './sprite'
import { Timer, time } from './time'
import { ecs } from '@/globals/init'

@Component(ecs)
export class Animator extends Timer {

}

const animateQuery = ecs.query.pick(Animator, TextureAtlasSprite)
export const animateSprites = () => {
	for (const [animator, sprite] of animateQuery.getAll()) {
		animator.tick(time.delta)
		if (animator.justFinished) {
			sprite.increment()
		}
	}
}
