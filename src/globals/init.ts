import { Group, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { Collider, ColliderDesc, RigidBody, RigidBodyDesc, World, init } from '@dimforge/rapier2d-compat'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { ECS } from '@/lib/ECS'

await init()

export const ecs = new ECS()
// ! THREE
ecs.registerComponent(WebGLRenderer)
ecs.registerComponent(CSS2DRenderer)
ecs.registerComponent(Group)
ecs.registerComponent(Scene)
ecs.registerComponent(OrthographicCamera)
ecs.registerComponent(CSS2DObject)
// ! RAPIER
ecs.registerComponent(RigidBodyDesc)
ecs.registerComponent(RigidBody)
ecs.registerComponent(World)
ecs.registerComponent(Collider)
ecs.registerComponent(ColliderDesc)
export const renderer = new WebGLRenderer({ antialias: true, alpha: true })
export const cssRenderer = new CSS2DRenderer()
