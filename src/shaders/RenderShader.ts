import type { Texture } from 'three'
import { ShaderMaterial, Uniform } from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import vertexShader from './glsl/main.vert?raw'
import fragmentShader from './glsl/color.frag?raw'

const renderShader = new ShaderMaterial({ vertexShader, fragmentShader })
export class RenderShader extends ShaderPass {
	constructor(texture: Texture) {
		super(renderShader)
		this.uniforms.uTexture = new Uniform(texture)
		this.material.transparent = true
	}
}
