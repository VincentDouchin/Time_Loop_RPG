import type { WebGLRenderer } from 'three'
import { LinearSRGBColorSpace, Scene } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import type { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { PixelTexture } from './pixelTexture'
import { cssRenderer, ecs, renderer } from '@/globals/init'

const initRenderer = (renderer: WebGLRenderer | CSS2DRenderer) => {
	renderer.setSize(window.innerWidth, window.innerHeight)
	document.body.appendChild(renderer.domElement)
}

export const scene = new Scene()
export const composer = new EffectComposer(renderer)
export const initThree = () => {
	ecs.spawn(scene)
	ecs.spawn(composer)
	initRenderer(renderer)
	initRenderer(cssRenderer)
	cssRenderer.domElement.style.position = 'fixed'
	renderer.outputColorSpace = LinearSRGBColorSpace
	renderer.setClearColor(0xFFFFFF, 0)
	renderer.autoClear = false

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
