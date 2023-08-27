import { ShaderMaterial, Uniform } from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import vertexShader from './glsl/main.vert?raw'
import fragmentShader from './glsl/color.frag?raw'

export const colorShader = new ShaderMaterial({ vertexShader, fragmentShader })

export class ColorShader extends ShaderPass {
	constructor(color: [x: number, y: number, z: number, w: number]) {
		super(colorShader.clone())
		this.uniforms.color = new Uniform(color)
	}
}
