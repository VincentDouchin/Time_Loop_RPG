import { World, init } from '@dimforge/rapier2d-compat'

export const createWorld = async () => {
	await init()
	return new World({ x: 0, y: 0 })
}
