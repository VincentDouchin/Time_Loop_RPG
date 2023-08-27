import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three'
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { ShaderComposer } from './shader'
import type { PixelTexture } from './pixelTexture'
import { Component } from './ECS'
import { ecs, renderer } from '@/globals/init'

@Component(ecs)
export class Sprite extends Mesh<PlaneGeometry, MeshBasicMaterial> {
	composer: ShaderComposer

	constructor(texture: PixelTexture) {
		const composer = new ShaderComposer(renderer, texture)
		const geometry = new PlaneGeometry(texture.image.width, texture.image.height)
		composer.render()
		const material = new MeshBasicMaterial({ map: composer.texture, transparent: true })
		super(geometry, material)
		this.composer = composer
	}

	addPass(shaderPass: ShaderPass) {
		this.composer.addPass(shaderPass)
	}

	removePass(shaderPass: ShaderPass) {
		this.composer.removePass(shaderPass)
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
}
@Component(ecs)
export class TextureAtlasSprite extends Sprite {
	index = 0
	constructor(public atlas: PixelTexture[], name: string) {
		super(atlas[0])
		this.name = name
	}

	setAtlas(atlas: PixelTexture[], name: string) {
		this.atlas = atlas
		this.composer.setInitialTexture(atlas[0])
		this.name = name
	}

	changeIndex(nb: number) {
		const newIndex = (this.index + nb) % (this.atlas.length)
		if (this.index !== newIndex) {
			this.index = newIndex
			this.composer.initialTarget.texture = this.atlas[this.index]
			this.composer.render()
		}
	}

	increment() {
		this.changeIndex(1)
	}

	decrement() {
		this.changeIndex(-1)
	}
}
