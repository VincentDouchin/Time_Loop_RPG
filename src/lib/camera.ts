import { OrthographicCamera, Scene, Texture, WebGLRenderer } from 'three'

import { Sprite } from './sprite'
import { cssRenderer, ecs, renderer } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { Position } from '@/lib/transforms'

@Component(ecs)
export class MainCamera {}
@Component(ecs)
export class CameraBounds {}
@Component(ecs)
export class CameraTarget {}
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

	ecs.spawn(
		new OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 0.1, 1000),
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

export const adjustScreenSize = () => {
	const screenSize = { x: window.innerWidth, y: window.innerHeight, changed: false }
	window.addEventListener('resize', () => {
		screenSize.x = window.innerWidth
		screenSize.y = window.innerHeight
		screenSize.changed = true
	})
	const cameraBoundsQuery = ecs.query.pick(Sprite, Position).with(CameraBounds)
	return () => {
		if (screenSize.changed) {
			for (const anyRenderer of [renderer, cssRenderer]) {
				anyRenderer.setSize(window.innerWidth, window.innerHeight)
			}
			for (const [camera] of mainCameraQuery.getAll()) {
				camera.left = -window.innerWidth / 2
				camera.right = window.innerWidth / 2
				camera.bottom = -window.innerHeight / 2
				camera.top = window.innerHeight / 2
			}
		}

		let zoom: null | number = null
		for (const [sprite] of cameraBoundsQuery.getAll()) {
			zoom = window.innerWidth / sprite.scaledDimensions.x
		}
		for (const [camera] of mainCameraQuery.getAll()) {
			if (zoom) {
				camera.zoom = zoom
				camera.updateProjectionMatrix()
			}
		}
	}
}
