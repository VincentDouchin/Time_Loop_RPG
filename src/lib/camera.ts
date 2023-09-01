import { OrthographicCamera, Scene, Texture, WebGLRenderer } from 'three'

import { Sprite } from './sprite'
import { cssRenderer, ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { Position } from '@/lib/transforms'

@Component(ecs)
export class MainCamera { }

@Component(ecs)
export class CameraTarget {
}
@Component(ecs)
export class FollowCamera {
	constructor(public x = false, public y = false) {}
	panTexture = false
	static horizontal() {
		return new FollowCamera(true, false)
	}

	textureFollowCamera() {
		this.panTexture = true
		return this
	}

	static vertical() {
		return new FollowCamera(false, true)
	}
}
export const spawnCamera = () => {
	const width = window.innerWidth
	const height = window.innerHeight

	const getCamera = (zoom: number) => new OrthographicCamera(width / -zoom, width / zoom, height / zoom, height / -zoom, 0.1, 1000)

	ecs.spawn(
		getCamera(5),
		new Position(0, 0, 10),
		new MainCamera(),
	)
}

const targetQuery = ecs.query.pick(Position).with(CameraTarget)
const mainCameraPositionQuery = ecs.query.pick(Position).with(MainCamera)
const followCameraQuery = ecs.query.pick(FollowCamera, Position)
const followCameraSpriteQuery = ecs.query.pick(FollowCamera, Sprite)

export const sceneQuery = ecs.query.pick(Scene)
export const mainCameraQuery = ecs.query.pick(OrthographicCamera).with(MainCamera)
export const rendererQuery = ecs.query.pick(WebGLRenderer)
export const cameraFollow = () => {
	for (const [cameraPosition] of mainCameraPositionQuery.getAll()) {
		for (const [followCamera, position] of followCameraQuery.getAll()) {
			if (followCamera.x) {
				position.x = cameraPosition.x
				position.init = false
			}
			if (followCamera.y) {
				position.y = cameraPosition.y
				position.init = false
			}
		}
		for (const [followCamera, sprite] of followCameraSpriteQuery.getAll()) {
			if (followCamera.panTexture) {
				sprite.material.map!.offset.y = cameraPosition.y / sprite.material.map!.image.height
			}
		}
		for (const [targetPosition] of targetQuery.getAll()) {
			cameraPosition.x = targetPosition.x
			cameraPosition.y = targetPosition.y
		}
		for (const [scene] of sceneQuery.getAll()) {
			if (scene.background instanceof Texture) {
				scene.background.offset.y = cameraPosition.y / scene.background.image.height
			}
		}
	}
}

export const render = () => {
	const scene = sceneQuery.extract()
	const renderer = rendererQuery.extract()
	const camera = mainCameraQuery.extract()
	if (renderer) {
		if (scene && camera) {
			cssRenderer.render(scene, camera)
			renderer.render(scene, camera)
		}
	}
}
