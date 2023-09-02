import { Color, ShaderMaterial, Uniform } from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import vertexShader from './glsl/main.vert?raw'
import fragmentShader from './glsl/outline.frag?raw'
import { Component } from '@/lib/ECS'
import { ecs } from '@/globals/init'
import { Sprite } from '@/lib/sprite'

export const shader = new ShaderMaterial({ vertexShader, fragmentShader })

@Component(ecs)
export class OutlineShader extends ShaderPass {
	constructor(color: Color = new Color(0xFFFFFF), opacity = 1) {
		super(shader.clone())
		this.uniforms.color = new Uniform([color.r, color.g, color.b, opacity])
	}

	setSize(x: number, y: number) {
		this.uniforms.size = new Uniform([x, y])
	}
}
const addedOutlineShader = ecs.query.pick(Sprite, OutlineShader).added(OutlineShader)
export const addOutlineShader = () => {
	for (const [sprite, shader] of addedOutlineShader.getAll()) {
		shader.setSize(sprite.width, sprite.height)
	}
}
