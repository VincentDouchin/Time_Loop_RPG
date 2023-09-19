import { ShaderMaterial, Uniform } from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import vertexShader from './glsl/main.vert?raw'
import noise from './glsl/lib/cnoise.glsl?raw'
import fragmentShader from './glsl/apocalypse.frag?raw'
import { Component } from '@/lib/ECS'
import { ecs } from '@/globals/init'
import { Timer, time } from '@/lib/time'

export const colorShader = new ShaderMaterial({
	vertexShader,
	fragmentShader: `${noise}
${fragmentShader}`,
})

@Component(ecs)
export class ApocalypseShader extends ShaderPass {
	timer = new Timer(10000)
	tick(time: number) {
		this.timer.tick(time)
		this.uniforms.time.value = this.timer.percentFinished
	}

	constructor() {
		super(colorShader.clone())

		this.uniforms.color = new Uniform([1, 0.2, 0.2, 0])
		this.uniforms.time = new Uniform(0)
	}
}

const apocalypseShaderQuery = ecs.query.pick(ApocalypseShader)
export const updateApocalypseShader = () => {
	for (const [shader] of apocalypseShaderQuery.getAll()) {
		shader.tick(time.delta)
	}
}
