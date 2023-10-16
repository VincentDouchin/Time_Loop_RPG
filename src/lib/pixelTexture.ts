import { RepeatWrapping, Texture } from 'three'
import { Component } from './ECS'
import { ecs } from '@/globals/init'

export class PixelTexture extends Texture {
	constructor(image: HTMLImageElement | HTMLCanvasElement | OffscreenCanvas) {
		super(image)
		this.needsUpdate = true
		this.wrapS = RepeatWrapping
		this.wrapT = RepeatWrapping
	}
}
