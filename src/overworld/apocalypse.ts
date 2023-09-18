import { stepsQuery } from './overworldUi'
import { assets, ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'

@Component(ecs)
export class Apocalypse {}
const apocalypseQuery = ecs.query.pick(Apocalypse)
export const triggerApocalypse = () => {
	for (const [steps] of stepsQuery.getAll()) {
		if (steps.amount === 4 && apocalypseQuery.size === 0) {
			// const bundle = TextureAtlas.single(assets.animatedTextures.explosion, 300)
			// const [sprite] = bundle
			// sprite.setScale(1)
			// ecs.spawn(...bundle, new Position(), new Apocalypse())
		}
	}
}
