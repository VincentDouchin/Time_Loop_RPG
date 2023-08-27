import { Group, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { Block, InlineBlock, Text } from 'three-mesh-ui'
import { ECS } from '@/lib/ECS'

export const ecs = new ECS()
// ! THREE
ecs.registerComponent(WebGLRenderer)
ecs.registerComponent(Group)
ecs.registerComponent(Scene)
ecs.registerComponent(OrthographicCamera)

// ! MESH UI
ecs.registerComponent(Block)
ecs.registerComponent(InlineBlock)
ecs.registerComponent(Text)

export const renderer = new WebGLRenderer({ antialias: true, alpha: true })
