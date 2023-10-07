import { Mesh, MeshBasicMaterial, PlaneGeometry, Vector2 } from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { Component } from './ECS'
import { PixelTexture } from './pixelTexture'
import { ShaderComposer } from './shader'
import { Timer } from './time'
import { ecs, renderer } from '@/globals/init'
import { getOffscreenBuffer } from '@/utils/buffer'

@Component(ecs)
export class Sprite extends Mesh<PlaneGeometry, MeshBasicMaterial> {
	composer: ShaderComposer
	width: number
	height: number
	#scale = new Vector2(1, 1)
	constructor(texture: PixelTexture) {
		const composer = new ShaderComposer(renderer, texture)
		const geometry = new PlaneGeometry(texture.image.width, texture.image.height)
		composer.render()
		const material = new MeshBasicMaterial({ map: composer.texture, transparent: true })
		super(geometry, material)
		this.width = texture.image.width
		this.height = texture.image.height
		this.composer = composer
	}

	setScale(x: number, y?: number) {
		this.#scale.x = x
		this.#scale.y = y || x
		this.geometry.scale(this.#scale.x, this.#scale.y, 1)
		return this
	}

	setOpacity(opacity: number) {
		this.material.opacity = opacity
		return this
	}

	anchor(anchorX = 0, anchorY = 0) {
		this.position.x = anchorX * this.scaledDimensions.x
		this.position.y = anchorY * this.scaledDimensions.y
		return this
	}

	get scaledDimensions() {
		return new Vector2(this.width, this.height).multiply(this.#scale)
	}

	addPass(shaderPass: ShaderPass) {
		this.composer.addPass(shaderPass)
	}

	set flip(flipped: boolean) {
		this.composer.texture.repeat.x = flipped ? -1 : 1
	}

	get flip() {
		return this.composer.texture.repeat.x === -1
	}

	setSize(width: number, height: number) {
		this.geometry = new PlaneGeometry(width, height)
		return this
	}

	setRenderOrder(nb: number) {
		this.renderOrder = nb
		return this
	}

	static fromBuffer(buffer: OffscreenCanvasRenderingContext2D) {
		return new Sprite(new PixelTexture(buffer.canvas))
	}

	static blank(width: number, height: number) {
		return Sprite.fromBuffer(getOffscreenBuffer(width, height))
	}
}
export type directionX = 'left' | 'right'
export type directionY = 'up' | 'down'
export interface TextureAltasStates<K extends string > {
	speed: { default: number } & Record<string, number>
	states: { [k in (K | `${K}-${directionX}-${directionY}`)]?: PixelTexture[] }
}

@Component(ecs)
export class Animator extends Timer {
	stopped = false
	stop() {
		this.stopped = true
		return this
	}
}

@Component(ecs)
export class TextureAtlas<K extends string> {
	nextStates: K[] = []
	index = 0
	animationsPlaying: Array<(val?: unknown) => void> = []
	constructor(public atlas: TextureAltasStates<K>, state: K, public directionX: directionX = 'left', public directionY: directionY = 'down') {
		this.nextStates = [state]
	}

	get state() {
		return this.nextStates[0]
	}

	set state(newState: K) {
		this.nextStates[0] = newState
	}

	get currentSpeed() {
		return this.atlas.speed[this.state] ?? this.atlas.speed.default
	}

	static single(atlas: PixelTexture[], speed = 100) {
		return this.bundle({ states: { default: atlas }, speed: { default: speed } }, 'default')
	}

	static bundle<K extends string>(textureAtlas: TextureAltasStates<K>, defaultState: K, directionX: directionX = 'left', directionY: directionY = 'down') {
		const atlas = new TextureAtlas(textureAtlas, defaultState, directionX, directionY)
		return [new Sprite(atlas.currentTexture), new Animator(100), atlas] as const
	}

	get #currentAtlas() {
		if (!this.directionX && !this.directionY) {
			return this.atlas.states[this.state]
		} else if (this.directionX && this.directionY && `${this.state}-${this.directionX}-${this.directionY}` in this.atlas.states) {
			return this.atlas.states[`${this.state}-${this.directionX}-${this.directionY}`]
		} else {
			return this.atlas.states[this.state]
		}
	}

	changeIndex(nb: number) {
		const newIndex = (this.index + nb)
		if (newIndex === (this.#currentAtlas?.length ?? 0)) {
			const res = this.animationsPlaying.shift()
			if (res) {
				res()
			}
			if (this.nextStates.length > 1) {
				this.index = 0
				this.nextStates.shift()
			}
		}

		if (this.index !== newIndex) {
			this.index = newIndex % (this.#currentAtlas?.length ?? 0)
		}
	}

	get currentTexture() {
		return this.#currentAtlas![this.index]
	}

	increment() {
		this.changeIndex(1)
	}

	decrement() {
		this.changeIndex(-1)
	}

	playAnimation(...states: K[]) {
		this.index = 0
		this.nextStates = [...states, this.state]
		return Promise.all(states.map(() => {
			return new Promise((resolve) => {
				this.animationsPlaying.push(resolve)
			})
		}))
	}
}

@Component(ecs)
export class FullScreenShader {}
