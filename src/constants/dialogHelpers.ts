import { LockedMovement } from '@/dungeon/playerMovement'
import { Player } from '@/genericComponents/components'
import { ecs } from '@/globals/init'
import { Entity } from '@/lib/ECS'

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
