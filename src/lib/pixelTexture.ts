import { RepeatWrapping, Texture } from 'three'
import { Component } from './ECS'
import { ecs } from '@/globals/init'

@Component(ecs)
export class PixelTexture extends Texture {
	constructor(image: HTMLImageElement | HTMLCanvasElement) {
		super(image)
		this.needsUpdate = true
		this.wrapS = RepeatWrapping
		this.wrapT = RepeatWrapping
	}
}
