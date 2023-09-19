import { Animator, Sprite, TextureAtlas } from './sprite'
import { time } from './time'
import { ecs } from '@/globals/init'

const animateQuery = ecs.query.pick(Animator, Sprite, TextureAtlas)
export const animateSprites = () => {
	for (const [animator, sprite, atlas] of animateQuery.getAll()) {
		if (!animator.stopped) {
			animator.tick(time.delta)
			animator.delay = atlas.currentSpeed
			if (animator.justFinished) {
				atlas.increment()
				sprite.composer.setInitialTexture(atlas.currentTexture)
			}
		}
	}
}
