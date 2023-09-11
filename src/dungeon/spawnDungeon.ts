import { PlayerInputMap, getPlayerInputMap } from './playerInputs'
import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { spawnLevel } from '@/level/spawnOverworld'
import { textureAtlasBundle } from '@/lib/bundles'
import { CameraTarget, mainCameraQuery } from '@/lib/camera'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'

export const spawnDungeon = spawnLevel(assets.levels.battle.levels[1])
export const spawnPlayer = () => {
	ecs.spawn(...textureAtlasBundle(assets.characters.MiniPrinceMan, 'idle', 200), new Position(), getPlayerInputMap(), new CameraTarget())
}
export const updateCamera = () => {
	for (const [camera] of mainCameraQuery.getAll()) {
		camera.zoom = 5
		camera.updateProjectionMatrix()
	}
}
const playerQuery = ecs.query.pick(PlayerInputMap, Position, TextureAtlas<'idle' | 'run'>, Sprite)
export const movePlayer = () => {
	for (const [inputs, position, atlas, sprite] of playerQuery.getAll()) {
		const speed = 0.5
		let isMoving = false
		if (inputs.get('up').pressed) {
			isMoving = true
			position.y += speed
		}
		if (inputs.get('down').pressed) {
			isMoving = true
			position.y -= speed
		}
		if (inputs.get('right').pressed) {
			isMoving = true
			position.x += speed
			sprite.flip = false
		}
		if (inputs.get('left').pressed) {
			isMoving = true
			position.x -= speed
			sprite.flip = true
		}
		atlas.state = isMoving ? 'run' : 'idle'
	}
}
