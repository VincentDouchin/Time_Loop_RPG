import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { NavNode } from '@/level/NavNode'
import { mapQuery } from '@/level/spawnOverworld'
import { textureAtlasBundle } from '@/lib/bundles'
import { Position } from '@/lib/transforms'
import { Navigator } from '@/navigation/navigation'

export type characterStates = 'idle' | 'attack' | 'death' | 'run' | 'hit' | 'jump'

const startNodeQuery = ecs.query.pick(NavNode, Position)
export const spawnOverworldCharacter = () => {
	for (const [mapEntity] of mapQuery.getAll()) {
		for (const [node, position] of startNodeQuery.getAll()) {
			if (node.data.type === 'Start') {
				const [sprite, animator, textureAtlas] = textureAtlasBundle<characterStates>(assets.characters.MiniPrinceMan, 'idle', 200)
				sprite.anchor(0, 8)
				mapEntity.spawn(
					sprite,
					animator,
					textureAtlas,
					new Position(position.x, position.y),
					new Navigator(node),
				)
			}
		}
	}
}
