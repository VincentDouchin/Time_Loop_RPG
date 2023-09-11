import { Group, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { ECS } from '@/lib/ECS'

export const ecs = new ECS()
// ! THREE
ecs.registerComponent(WebGLRenderer)
ecs.registerComponent(CSS2DRenderer)
ecs.registerComponent(Group)
ecs.registerComponent(Scene)
ecs.registerComponent(OrthographicCamera)
ecs.registerComponent(CSS2DObject)

export const renderer = new WebGLRenderer({ antialias: true, alpha: true })
export const cssRenderer = new CSS2DRenderer()
