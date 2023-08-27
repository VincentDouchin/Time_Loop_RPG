import { World } from '@dimforge/rapier2d-compat'
import { time } from './time'
import { ecs } from '@/globals/init'

export const createWorld = () => {
	ecs.spawn(new World({ x: 0, y: 0 }))
}
export const worldQuery = ecs.query.pick(World)
export const stepWorld = () => {
	const worldResult = worldQuery.getSingle()
	if (worldResult) {
		worldResult[0].timestep = time.delta / 1000
		worldResult[0].step()
	}
}
