import { Collider, ColliderDesc, ImpulseJoint, RigidBody, RigidBodyDesc, World, init } from '@dimforge/rapier2d-compat'
import { Group, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { loadAssets } from './assets'
import { PixelTexture } from '@/lib/pixelTexture'
import { ECS } from '@/lib/ECS'
import { createWorld } from '@/lib/world'

export const world = await createWorld()
world.timestep = 60 / 1000
export const assets = await loadAssets()
export const ecs = new ECS()
// await new Promise(resolve => setTimeout(resolve, 5000))
// ! THREE
ecs.registerComponent(WebGLRenderer)
ecs.registerComponent(CSS2DRenderer)
ecs.registerComponent(Group)
ecs.registerComponent(Scene)
ecs.registerComponent(OrthographicCamera)
ecs.registerComponent(CSS2DObject)
ecs.registerComponent(PixelTexture)
// ! RAPIER
ecs.registerComponent(RigidBodyDesc)
ecs.registerComponent(RigidBody)
ecs.registerComponent(World)
ecs.registerComponent(Collider)
ecs.registerComponent(ColliderDesc)
ecs.registerComponent(ImpulseJoint)
export const renderer = new WebGLRenderer({ antialias: true, alpha: true })
export const cssRenderer = new CSS2DRenderer()
