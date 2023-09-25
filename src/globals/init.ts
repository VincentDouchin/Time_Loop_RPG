import { Collider, ColliderDesc, ImpulseJoint, RigidBody, RigidBodyDesc, World } from '@dimforge/rapier2d-compat'
import { Group, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { loadAssets } from './assets'
import { createWorld } from '@/lib/world'
import { PixelTexture } from '@/lib/pixelTexture'
import type { Class } from '@/lib/ECS'
import { ECS, Entity, SystemSet } from '@/lib/ECS'

export const world = await createWorld()
export const assets = await loadAssets()
export const ecs = new ECS()
// ! THREE
ecs.registerComponent(WebGLRenderer)
ecs.registerComponent(CSS2DRenderer)
ecs.registerComponent(Group)
ecs.registerComponent(Scene)
ecs.registerComponent(OrthographicCamera)
ecs.registerComponent(CSS2DObject)
ecs.registerComponent(PixelTexture)
ecs.registerComponent(EffectComposer)
// ! RAPIER
ecs.registerComponent(RigidBodyDesc)
ecs.registerComponent(RigidBody)
ecs.registerComponent(World)
ecs.registerComponent(Collider)
ecs.registerComponent(ColliderDesc)
ecs.registerComponent(ImpulseJoint)

export const renderer = new WebGLRenderer({ antialias: true, alpha: true })
export const cssRenderer = new CSS2DRenderer()

export const despawnEntities = (...components: Class[]) => {
	return SystemSet(...components.map((component) => {
		const query = ecs.query.pick(Entity).with(component)
		return () => {
			for (const [entity] of query.getAll()) {
				entity.despawn()
			}
		}
	}))
}
