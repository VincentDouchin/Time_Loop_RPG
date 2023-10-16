import { ShaderMaterial, Uniform } from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import fragmentShader from './glsl/color.frag?raw'
import vertexShader from './glsl/main.vert?raw'

export const colorShader = new ShaderMaterial({ vertexShader, fragmentShader })

export class ColorShader extends ShaderPass {
	constructor(color: [x: number, y: number, z: number, w: number], additive: boolean = false) {
		super(colorShader.clone())
		this.uniforms.color = new Uniform(color)
		this.uniforms.additive = new Uniform(additive)
	}
}
