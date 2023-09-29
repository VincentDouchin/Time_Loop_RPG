import { Collider } from '@dimforge/rapier2d-compat'
import { NPC } from '@/dungeon/NPC'
import { LockedMovement } from '@/dungeon/playerMovement'
import { Player } from '@/genericComponents/components'
import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { sleep } from '@/utils/timing'

@Component(ecs)
export class Log {}

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

const npcQuery = ecs.query.pick(TextureAtlas, NPC, Position)
const logQuery = ecs.query.pick(Entity).with(Log)
export const chopLog = () => {
	for (const [atlas, npc, pos] of npcQuery.getAll()) {
		atlas.directionY = 'up'
		atlas.state = 'walk'
		new Tween(2000)
			.onUpdate((x) => {
				pos.y = x
				pos.init = false
			}, pos.y, pos.y + 8)
			.onComplete(() => {
				atlas.state = 'logging'
				sleep(3000).then(() => {
					unlockPlayer()
					atlas.directionY = 'down'
					atlas.directionX = 'right'
					atlas.state = 'walk'
					new Tween(2000)
						.onUpdate((x) => {
							pos.x = x
							pos.init = false
						}, pos.x, pos.x + 16)
						.onComplete(() => {
							unlockPlayer()
							atlas.state = 'idle'
						})
				})
			})
	}
}
