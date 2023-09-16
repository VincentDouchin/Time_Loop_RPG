import { Collider, ColliderDesc, ImpulseJoint, RigidBody, RigidBodyDesc, World } from '@dimforge/rapier2d-compat'
import { Group, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import nipplejs from 'nipplejs'
import { loadAssets } from './assets'
import { createWorld } from '@/lib/world'
import { PixelTexture } from '@/lib/pixelTexture'
import { ECS } from '@/lib/ECS'

export const world = await createWorld()
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
