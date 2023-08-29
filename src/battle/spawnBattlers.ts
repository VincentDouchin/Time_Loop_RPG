import { Block } from 'three-mesh-ui'
import { Color } from 'three'
import type { characterStates } from '@/character/spawnOverworldCharacter'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { textureAtlasBundle } from '@/lib/bundles'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'

const spawnBattleUi = () => {
	ecs
		.spawn(new Block({ width: window.innerWidth, height: window.innerHeight, backgroundOpacity: 0, justifyContent: 'end' }))
		.spawn(new Block({ width: window.innerWidth * 0.8, margin: 20, height: 100, backgroundColor: new Color(0xFF0000) }))
}

export const spawnBattlers = () => {
	const sides = [
		[assets.characters.MiniPrinceMan],
		[assets.characters.MiniGoblin, assets.characters.MiniGoblinThief, assets.characters.MiniGoblin],
	]
	for (let i = 0; i < sides.length; i++) {
		const characters = sides[i]
		for (let j = 0; j < characters.length; j++) {
			const bundle = textureAtlasBundle<characterStates>(characters[j], 'run', 200)
			const [sprite, _, atlas] = bundle
			sprite.setScale(1.5)
			sprite.flip = i !== 0
			const direction = i === 0 ? -1 : 1
			const edge = assets.levels.battle.levels[0].pxWid / 2 * direction
			const y = 1 + j
			const position = new Position(edge, y * 50 - characters.length * 25)
			ecs.spawn(...bundle, position)
			new Tween(500)
				.onUpdate(x => position.x = x, edge, edge + 50 * -direction)
				.onComplete(() => {
					atlas.state = 'idle'
					spawnBattleUi()
				})
		}
	}
}
