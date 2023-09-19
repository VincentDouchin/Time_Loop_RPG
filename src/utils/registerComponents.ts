import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { Group } from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { ecs, world } from '@/globals/init'
import type { Class, Constructor, ECS, System } from '@/lib/ECS'
import { Entity } from '@/lib/ECS'

import { sceneQuery } from '@/lib/camera'
import { composer } from '@/lib/rendering'
import { FullScreenShader, Sprite } from '@/lib/sprite'
import { Position } from '@/lib/transforms'

export const addToScene = (...components: Class[]) => (ecs: ECS) => {
	// ! SCENE

	for (const component of components) {
		// ! CREATE GROUP
		const withoutGroupQuery = ecs.query.pick(Entity, component).without(Group).added(component)
		const removedQuery = ecs.query.pick(component).removed(component)

		ecs.core.onPostUpdate(() => {
			for (const [entity, component] of withoutGroupQuery.getAll()) {
				const group = new Group()
				group.add(component)
				entity.addComponent(group)
			}
		})
		ecs.core.onPreUpdate(() => {
			for (const [component] of removedQuery.getAll()) {
				component.removeFromParent()
			}
		})
	}
	const withGroupquery = ecs.query.pick(Entity, Group, Position).added(Group)
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
	const systems: System[] = []
	for (const shaderPass of shaderPasses) {
		const query = ecs.query.pick(Sprite, shaderPass).added(shaderPass)
		systems.push(() => {
			for (const [sprite, shader] of query.getAll()) {
				sprite.composer.addPass(shader)
			}
		})
		const removedQuery = ecs.query.pick(Sprite).removed(shaderPass)
		systems.push(() => {
			for (const [sprite] of removedQuery.getAll()) {
				sprite.composer.removePass(shaderPass)
			}
		})
		const fullScreenShaderAddedQuery = ecs.query.pick(shaderPass).with(FullScreenShader).added(shaderPass)
		systems.push(() => {
			for (const [pass] of fullScreenShaderAddedQuery.getAll()) {
				composer.addPass(composer.copyPass)
				composer.addPass(pass)
			}
		})
		const fullScreenShaderRemovedQuery = ecs.query.pick(shaderPass).with(FullScreenShader).removed(shaderPass)
		systems.push(() => {
			for (const [pass] of fullScreenShaderRemovedQuery.getAll()) {
				const index = composer.passes.indexOf(pass)
				composer.passes.splice(index, 2)
			}
		})
	}
	return systems
}

const bodyQuery = ecs.query.pick(RigidBodyDesc, Entity).without(RigidBody)
const colliderQuery = ecs.query.pick(ColliderDesc, RigidBody, Entity).without(Collider)
const removedQuery = ecs.query.pick(RigidBody).removed(RigidBody)
export const addToWorld = () => {
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
}
