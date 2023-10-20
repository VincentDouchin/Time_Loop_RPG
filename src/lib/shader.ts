import type { Texture, WebGLRenderer } from 'three'
import { ClampToEdgeWrapping, NearestFilter, RGBAFormat, WebGLRenderTarget } from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader'
import type { Constructor } from './ECS'
import type { PixelTexture } from './pixelTexture'

export class ShaderComposer {
	static copyPass = new ShaderPass(CopyShader)
	width: number
	height: number
	passes: ShaderPass[] = []
	targets: WebGLRenderTarget[] = []
	initialTarget: WebGLRenderTarget
	target: WebGLRenderTarget
	constructor(private renderer: WebGLRenderer, texture?: Texture) {
		this.width = texture?.image.width ?? window.innerWidth
		this.height = texture?.image.height ?? window.innerHeight
		this.target = this.newTarget()
		this.initialTarget = this.newTarget()
		this.initialTarget.texture = texture ?? this.newTarget().texture
	}

	setInitialTexture(texture: PixelTexture) {
		this.initialTarget.texture = texture
		this.render()
	}

	newTarget() {
		const target = new WebGLRenderTarget(this.width, this.height)
		target.texture.minFilter = NearestFilter
		target.texture.magFilter = NearestFilter
		return target
	}

	get texture() {
		return this.target.texture
	}

	addPass(pass: ShaderPass) {
		this.passes.push(pass)
		this.targets.push(this.newTarget())
		this.render()
	}

	removePass(shaderPass: Constructor<ShaderPass>) {
		const index = this.passes.findIndex(shader => shader instanceof shaderPass)
		this.passes.splice(index, 1)
		this.targets.splice(index, 1)
		this.render()
	}

	isLastEnabledPass(index: number) {
		return index === this.passes.length - 1
	}

	renderPass(pass: ShaderPass, read: WebGLRenderTarget, write: WebGLRenderTarget) {
		pass.render(this.renderer, write, read, 0, false)
	}

	render() {
		const currentRenderTarget = this.renderer.getRenderTarget()
		if (this.passes.length === 0) {
			this.renderPass(ShaderComposer.copyPass, this.initialTarget, this.target)
		} else {
			for (let i = 0; i < this.passes.length; i++) {
				const pass = this.passes[i]
				const read = i === 0 ? this.initialTarget : this.targets[i - 1]
				const write = i === this.passes.length - 1 ? this.target : this.targets[i]
				this.renderPass(ShaderComposer.copyPass, read, write)
				this.renderPass(pass, read, write)
			}
		}
		this.renderer.setRenderTarget(currentRenderTarget)
	}
}
