import { ShaderMaterial, Uniform } from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import vertexShader from './glsl/main.vert?raw'
import fragmentShader from './glsl/itemPickup.frag?raw'
import { Component } from '@/lib/ECS'
import { ecs } from '@/globals/init'

export const shader = new ShaderMaterial({ vertexShader, fragmentShader })

@Component(ecs)
export class ItemPickupShader extends ShaderPass {
	constructor(radius = 1) {
		super(shader.clone())
		this.uniforms.radius = new Uniform(radius)
	}
}
