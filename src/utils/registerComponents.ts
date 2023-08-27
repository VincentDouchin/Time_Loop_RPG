import { Collider, ColliderDesc, RigidBody, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { Group } from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { Block, Text } from 'three-mesh-ui'
import { ecs } from '@/globals/init'
import type { Class, Constructor } from '@/lib/ECS'
import { Entity } from '@/lib/ECS'
import { worldQuery } from '@/lib/world'
import { UISceneQuery, sceneQuery } from '@/lib/camera'
import { UIContainer } from '@/ui/spawnUI'
import { Position } from '@/lib/transforms'

export const addToScene = (...components: Class[]) => {
	// ! UI
	const uiElementAddedQuery = ecs.query.pick(Entity, Block).added(Block).without(UIContainer)
	ecs.core.onEnter(() => {
		const block = new Block({
			width: window.innerWidth,
			height: window.innerHeight,
			justifyContent: 'start',
			textAlign: 'center',
			backgroundOpacity: 0,
		})
		ecs.spawn(block,
			new UIContainer(),
		)
	})
	const textQuery = ecs.query.pick(Block, Text).added(Text)
	const removedBlockQuery = ecs.query.pick(Block).removed(Block)
	const removedTextQuery = ecs.query.pick(Text).removed(Text)
	const uiContainerQuery = ecs.query.pick(Block).with(UIContainer)

	ecs.core.onPostUpdate(() => {
		const uiScene = UISceneQuery.extract()
		const uiContainer = uiContainerQuery.extract()
		if (uiScene && uiContainer) {
			uiScene.add(uiContainer)
		}
		const container = uiContainerQuery.extract()
		for (const [entity, block] of uiElementAddedQuery.getAll()) {
			const parent = entity.parent?.getComponent(Block) ?? container
			if (parent) {
				parent.add(block)
			}
		}
		for (const [block, text] of textQuery.getAll()) {
			block.add(text)
		}
		for (const [block] of removedBlockQuery.getAll()) {
			block.removeFromParent()
		}
		for (const [text] of removedTextQuery.getAll()) {
			text.removeFromParent()
		}
	})

	// ! SCENE
	const withGroupquery = ecs.query.pick(Entity, Group, Position).added(Group)
	for (const component of components) {
		// ! CREATE GROUP
		const withoutGroupQuery = ecs.query.pick(Entity, component).without(Group).added(component)
		ecs.core.onPostUpdate(() => {
			for (const [entity, component] of withoutGroupQuery.getAll()) {
				const group = new Group()
				group.add(component)
				entity.addComponent(group)
			}
		})
	}
	ecs.core.onPostUpdate(() => {
		for (const [entity, group, position] of withGroupquery.getAll()) {
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
			ecs.registerComponent(shaderPass)
			const query = ecs.query.pick(sprite, shaderPass).added(shaderPass)
			// const removedQuery = ecs.query.pick(sprite, Entity).removed(shaderPass)
			ecs.core.onPostUpdate(() => {
				for (const [sprite, shader] of query.getAll()) {
					sprite.addPass(shader)
				}
				// for (const [sprite, entity] of removedQuery.getAll()) {
				// const pass = ecs.getRemovedComponentsMap(shaderPass).get(entity)
				// if (pass) {
				// sprite.removePass(pass)
				// }
				// }
			})
		}
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
