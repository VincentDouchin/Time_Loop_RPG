import { mapQuery } from './spawnOverworld'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { NavNode } from '@/level/NavNode'
import { CameraTarget } from '@/lib/camera'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Navigator } from '@/overworld/navigation'
import { save } from '@/save/saveData'

const navigatorQuery = ecs.query.with(Navigator)
const startNodeQuery = ecs.query.pick(NavNode, Position)
export const spawnOverworldCharacter = () => {
	if (!navigatorQuery.size) {
		for (const [mapEntity] of mapQuery.getAll()) {
			const lastNode = startNodeQuery.toArray().find(([node]) => node.id === save?.lastNodeUUID)
			const startNode = startNodeQuery.toArray().find(([node]) => node.data.type === 'Start')
			const nodeEntity = lastNode ?? startNode
			if (nodeEntity) {
				const [node, position] = nodeEntity
				const [sprite, animator, textureAtlas] = TextureAtlas.bundle(assets.characters.paladin, 'idle', 'left', 'down')
				sprite.anchor(0, 0)
				mapEntity.spawn(
					sprite,
					animator,
					textureAtlas,
					new CameraTarget(),
					new Position(position.x, position.y),
					new Navigator(node),
				)
			}
		}
	}
}
