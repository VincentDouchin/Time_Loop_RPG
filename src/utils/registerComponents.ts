import { Group } from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { ecs } from '@/globals/init'
import type { Class, Constructor } from '@/lib/ECS'
import { sceneQuery } from '@/lib/camera'
import { Position } from '@/lib/transforms'

export const addToScene = (...components: Class[]) => {
	// ! SCENE
	const withGroupquery = ecs.query.pick(Group, Position).added(Group)
	for (const component of components) {
		// ! CREATE GROUP
		const withoutGroupQuery = ecs.query.pick(component).without(Group).added(component)
		ecs.core.onPostUpdate(() => {
			for (const [entity, component] of withoutGroupQuery.getEntities()) {
				const group = new Group()
				group.add(component)
				entity.addComponent(group)
			}
		})
	}
	ecs.core.onPostUpdate(() => {
		for (const [entity, group, position] of withGroupquery.getEntities()) {
			group.position.add(position)
			const parent = entity.parent?.getComponent(Group) ?? sceneQuery.extract()!
			parent.add(group)
		}
	})
	const despawnQuery = ecs.query.pick(Group).removed(Group)
	ecs.core.onPostUpdate(() => {
		for (const [group] of despawnQuery.getAll()) {
			group.removeFromParent()
		}
	})
}

export const registerShader = (...sprites: Class[]) => (...shaderPasses: Constructor<ShaderPass>[]) => {
	for (const sprite of sprites) {
		for (const shaderPass of shaderPasses) {
			const query = ecs.query.pick(sprite, shaderPass).added(shaderPass)
			ecs.core.onPostUpdate(() => {
				for (const [sprite, shader] of query.getAll()) {
					sprite.addPass(shader)
				}
			})
		}
	}
}
