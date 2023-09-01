import { LinearSRGBColorSpace, Scene } from 'three'
import { PixelTexture } from './pixelTexture'
import { cssRenderer, ecs, renderer } from '@/globals/init'

export const initThree = () => {
	ecs.spawn(new Scene())
	renderer.setSize(window.innerWidth, window.innerHeight)
	cssRenderer.setSize(window.innerWidth, window.innerHeight)
	cssRenderer.domElement.style.position = 'fixed'
	renderer.outputColorSpace = LinearSRGBColorSpace
	renderer.setPixelRatio(devicePixelRatio)
	renderer.setClearColor(0xFFFFFF, 0)
	renderer.autoClear = false
	document.body.appendChild(renderer.domElement)
	document.body.appendChild(cssRenderer.domElement)
	ecs.spawn(renderer)
}

const sceneBackgroundQuery = ecs.query.pick(Scene, PixelTexture).added(PixelTexture)
export const addBackgroundToScene = () => {
	for (const [scene, texture] of sceneBackgroundQuery.getAll()) {
		scene.background = texture
		texture.repeat.x = window.innerWidth / texture.image.width
		texture.repeat.y = window.innerHeight / texture.image.height
	}
}
