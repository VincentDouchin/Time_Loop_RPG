import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { JustEntered } from './dungeonComponents'
import { getPlayerInputMap } from './playerInputs'
import { Player } from '@/generic/components'
import { assets } from '@/globals/init'
import { CameraTarget } from '@/lib/camera'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'

export const PlayerBundle = (pos: Position) => {
	const bundle = TextureAtlas.bundle(assets.characters.paladin, 'idle', 'left', 'down')
	bundle[0].setRenderOrder(10)
	return [
		...bundle,
		new Position(pos.x, pos.y),
		getPlayerInputMap(),
		new CameraTarget(),
		new Player(),
		new JustEntered(),
		RigidBodyDesc.dynamic(),
		ColliderDesc.cuboid(3, 3),
	]
}