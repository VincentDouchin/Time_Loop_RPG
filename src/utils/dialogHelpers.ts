import { RigidBody } from '@dimforge/rapier2d-compat'
import { addKey } from '../constants/dialogs'
import { NPC } from '@/states/dungeon/NPC'
import { LockedMovement } from '@/states/dungeon/playerMovement'
import { Dungeon } from '@/states/dungeon/dungeonComponents'
import { Player } from '@/generic/components'
import { despawnEntities, ecs } from '@/globals/init'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { Component, Entity } from '@/lib/ECS'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { sleep } from '@/utils/timing'
import { Dialog } from '@/states/dungeon/dialog'
import { Cutscene } from '@/states/battle/cutscene'
import { logBundle } from '@/states/dungeon/log'
import { save, saveToLocalStorage } from '@/save/saveData'

@Component(ecs)
export class Log { }

const playerQuery = ecs.query.pick(Entity, RigidBody).with(Player)
export const lockPlayer = () => {
	for (const [player, body] of playerQuery.getAll()) {
		body.setLinvel({ x: 0, y: 0 }, true)
		player.addComponent(new LockedMovement())
	}
}
export const unlockPlayer = () => {
	for (const [player] of playerQuery.getAll()) {
		player.removeComponent(LockedMovement)
	}
}

const npcQuery = ecs.query.pick(Entity, TextureAtlas, Position, NPC)
const logQuery = ecs.query.pick(Entity, Position, LDTKEntityInstance).with(Log)
const dungeonQuery = ecs.query.pick(Entity).with(Dungeon)
export const chopLog = async () => {
	for (const [entity, atlas, pos, npc] of npcQuery.getAll()) {
		if (npc.data.name === 'lumberjack') {
			const dialog = entity.getComponent(Dialog)
			entity.removeComponent(Dialog)
			atlas.directionY = 'up'
			atlas.state = 'walk'
			await new Tween(1000).onUpdate((x) => {
				pos.y = x
				pos.init = false
			}, pos.y, pos.y + 8).start()
			atlas.state = 'logging'
			await sleep(5000)
			const log = logQuery.getSingle()
			if (log) {
				const [logEntity, logPos, logEntityInstance] = log
				ecs.onNextTick(() => logEntity?.despawn())
				const dungeonEntity = dungeonQuery.extract()
				if (dungeonEntity) {
					dungeonEntity.spawn(logBundle(true, logEntityInstance, logPos))
				}
			}
			addKey('splitLog')
			unlockPlayer()
			atlas.directionY = 'down'
			atlas.directionX = 'right'
			atlas.state = 'walk'
			await new Tween(2000).onUpdate((x) => {
				pos.x = x
				pos.init = false
			}, pos.x, pos.x + 16).start()
			atlas.state = 'idle'
			entity.addComponent(dialog)
		}
	}
}

export const pay = (amount: number) => {
	if (save.money >= amount) {
		save.money -= amount
		saveToLocalStorage()
		return true
	} else {
		return false
	}
}

export const despwawnCutscene = despawnEntities(Cutscene)