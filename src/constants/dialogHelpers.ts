import { RigidBody } from '@dimforge/rapier2d-compat'
import { NPC } from '@/dungeon/NPC'
import { LockedMovement } from '@/dungeon/playerMovement'
import { Player } from '@/genericComponents/components'
import { assets, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { PixelTexture } from '@/lib/pixelTexture'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { sleep } from '@/utils/timing'

@Component(ecs)
export class Log { }

const playerQuery = ecs.query.pick(Entity).with(Player)
export const lockPlayer = () => {
	for (const [player] of playerQuery.getAll()) {
		player.addComponent(new LockedMovement())
	}
}
export const unlockPlayer = () => {
	for (const [player] of playerQuery.getAll()) {
		player.removeComponent(LockedMovement)
	}
}

const npcQuery = ecs.query.pick(TextureAtlas, Position).with(NPC)
const logQuery = ecs.query.pick(Entity).with(Log)
export const chopLog = async () => {
	for (const [atlas, pos] of npcQuery.getAll()) {
		atlas.directionY = 'up'
		atlas.state = 'walk'
		await new Tween(1000).onUpdate((x) => {
			pos.y = x
			pos.init = false
		}, pos.y, pos.y + 8).start()
		atlas.state = 'logging'
		await sleep(1000)
		const log = logQuery.extract()
		log?.removeComponent(Sprite)
		log?.addComponent(new Sprite(new PixelTexture(assets.staticItems.logSplit)))
		// log?.addComponent(new )
		// log?.getComponent(Sprite)?.composer.setInitialTexture(new PixelTexture(assets.staticItems.logSplit))
		// log?.removeComponent(Sprite)
		log?.removeComponent(RigidBody)
		unlockPlayer()
		atlas.directionY = 'down'
		atlas.directionX = 'right'
		atlas.state = 'walk'
		await new Tween(2000).onUpdate((x) => {
			pos.x = x
			pos.init = false
		}, pos.x, pos.x + 16).start()
		unlockPlayer()
		atlas.state = 'idle'
	}
}
