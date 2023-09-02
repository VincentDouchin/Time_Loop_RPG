import { Group } from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { ecs } from '@/globals/init'
import { type Class, type Constructor, Entity } from '@/lib/ECS'
import { sceneQuery } from '@/lib/camera'
import { Position } from '@/lib/transforms'
import { Sprite } from '@/lib/sprite'

export const addToScene = (...components: Class[]) => {
	// ! SCENE
	const withGroupquery = ecs.query.pick(Entity, Group, Position).added(Group)
	for (const component of components) {
		// ! CREATE GROUP
		const withoutGroupQuery = ecs.query.pick(Entity, component).without(Group).added(component)

		ecs.core.onUpdate(() => {
			for (const [entity, component] of withoutGroupQuery.getAll()) {
				const group = new Group()
				group.add(component)
				entity.addComponent(group)
			}
		})
	}
	ecs.core.onUpdate(() => {
		for (const [entity, group, position] of withGroupquery.getAll()) {
			group.position.add(position)
			const parent = entity.parent?.getComponent(Group) ?? sceneQuery.extract()!
			parent.add(group)
		}
	})
	const despawnQuery = ecs.query.pick(Group).removed(Group)
	ecs.core.onUpdate(() => {
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
			const removedQuery = ecs.query.pick(Sprite, shaderPass).removed(shaderPass)
			ecs.core.onPostUpdate(() => {
				for (const [sprite, shader] of removedQuery.getAll()) {
					sprite.composer.removePass(shader)
				}
			})
		}
	}
}
