import { mapQuery } from './spawnOverworld'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { NavNode } from '@/level/NavNode'
import { textureAtlasBundle } from '@/lib/bundles'
import { Position } from '@/lib/transforms'
import { Navigator } from '@/overworld/navigation'

const navigatorQuery = ecs.query.with(Navigator)
const startNodeQuery = ecs.query.pick(NavNode, Position)
export const spawnOverworldCharacter = () => {
	if (!navigatorQuery.size) {
		for (const [mapEntity] of mapQuery.getAll()) {
			for (const [node, position] of startNodeQuery.getAll()) {
				if (node.data.type === 'Start') {
					const [sprite, animator, textureAtlas] = textureAtlasBundle(assets.characters.paladin, 'idle', 'left', 'down')
					sprite.anchor(0, 0)
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
}
