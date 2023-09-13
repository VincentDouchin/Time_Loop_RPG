import { Group } from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { ecs } from '@/globals/init'
import { type Class, type Constructor, Entity } from '@/lib/ECS'
import { sceneQuery } from '@/lib/camera'
import { Position } from '@/lib/transforms'
import { Sprite } from '@/lib/sprite'
import { worldQuery } from '@/lib/world'

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

export const registerShader = (...shaderPasses: Constructor<ShaderPass>[]) => {
	for (const shaderPass of shaderPasses) {
		const query = ecs.query.pick(Sprite, shaderPass).added(shaderPass)
		ecs.core.onUpdate(() => {
			for (const [sprite, shader] of query.getAll()) {
				sprite.composer.addPass(shader)
			}
		})
		const removedQuery = ecs.query.pick(Sprite).removed(shaderPass)
		ecs.core.onUpdate(() => {
			for (const [sprite] of removedQuery.getAll()) {
				sprite.composer.removePass(shaderPass)
			}
		})
	}
}
export const addToWorld = () => {
	const bodyQuery = ecs.query.pick(RigidBodyDesc, Entity).without(RigidBody)
	const colliderQuery = ecs.query.pick(ColliderDesc, RigidBody, Entity).without(Collider)
	const removedQuery = ecs.query.pick(RigidBody).removed(RigidBody)
	ecs.core.onPostUpdate(() => {
		const world = worldQuery.extract()
		if (world) {
			for (const [bodyDesc, entity] of bodyQuery.getAll()) {
				const body = world.createRigidBody(bodyDesc)
				entity.addComponent(body)
			}
			for (const [colliderDesc, rigidBody, entity] of colliderQuery.getAll()) {
				const collider = world.createCollider(colliderDesc, rigidBody)
				entity.addComponent(collider)
			}
			for (const [body] of removedQuery.getAll()) {
				world.removeRigidBody(body)
			}
		}
	})
}
