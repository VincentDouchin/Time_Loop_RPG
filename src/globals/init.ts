import { Collider, ColliderDesc, ImpulseJoint, RigidBody, RigidBodyDesc, World } from '@dimforge/rapier2d-compat'
import { Group, OrthographicCamera, Scene, WebGLRenderer } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { loadAssets } from './assets'
import type { BattleData } from '@/constants/battles'
import type { Class } from '@/lib/ECS'
import { ECS, Entity, State, SystemSet } from '@/lib/ECS'
import { createWorld } from '@/lib/world'
import { ColorShader } from '@/shaders/ColorShader'
import type { direction } from '@/states/dungeon/spawnDungeon'
import { PixelTexture } from '@/lib/pixelTexture'

export const world = await createWorld()
export const assets = await loadAssets()
export const ecs = new ECS()

export const overworldState = ecs.state()

export type battleRessources = [BattleData]
export const battleState = ecs.state<battleRessources>()

export type dungeonRessources = [levels, number, direction]
export const dungeonState = ecs.state<dungeonRessources>()
State.exclusive(overworldState, battleState, dungeonState)

export const startGame = ecs.state()
// ! THREE
ecs.registerComponent(WebGLRenderer)
ecs.registerComponent(CSS2DRenderer)
ecs.registerComponent(Group)
ecs.registerComponent(Scene)
ecs.registerComponent(OrthographicCamera)
ecs.registerComponent(CSS2DObject)
ecs.registerComponent(EffectComposer)
// ! RAPIER
ecs.registerComponent(RigidBodyDesc)
ecs.registerComponent(RigidBody)
ecs.registerComponent(World)
ecs.registerComponent(Collider)
ecs.registerComponent(ColliderDesc)
ecs.registerComponent(ImpulseJoint)

ecs.registerComponent(PixelTexture)
ecs.registerComponent(ColorShader)

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
