import type { Properties, StandardProperties } from 'csstype'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { Position } from '@/lib/transforms'
import { toCanvas } from '@/utils/buffer'
import { Tween } from '@/lib/tween'

@Component(ecs)
export class UIElement extends HTMLDivElement {
	constructor(styles: StandardProperties = {}) {
		super()
		this.setStyles(styles)
	}

	setStyle<K extends keyof StandardProperties>(key: K, value: StandardProperties[K]) {
		(<any> this.style)[key] = value
		return this
	}

	setStyles(styles: StandardProperties) {
		for (const [key, val] of Object.entries(styles) as [keyof Properties, any]) {
			this.style[key] = val
		}
		return this
	}

	static fromImage(source: HTMLCanvasElement | OffscreenCanvas, scale = 1) {
		const canvas = source instanceof OffscreenCanvas ? toCanvas(source) : source
		return new UIElement({
			backgroundImage: `url(${canvas.toDataURL()})`,
			width: `${canvas.width * scale}px`,
			height: `${canvas.height * scale}px`,
			imageRendering: 'pixelated',
			backgroundSize: 'cover',
		})
	}

	get center() {
		const coords = this.getBoundingClientRect()
		return {
			x: coords.left + this.clientWidth / 2,
			y: coords.top + this.clientHeight / 2,
		}
	}

	moveTo(target: UIElement, duration: number) {
		const targetCoord = target.getBoundingClientRect()
		const initialCoord = this.getBoundingClientRect()
		return new Tween(duration).onUpdate((r) => {
			const x = (targetCoord.left - initialCoord.left + (targetCoord.width - initialCoord.width) / 2) * r
			const y = (targetCoord.top - initialCoord.top + (targetCoord.height - initialCoord.height) / 2) * r
			this.setStyle('translate', `${x}px ${y}px`)
		})
	}

	withWorldPosition(x = 0, y = 0) {
		return [this, new CSS2DObject(this), new Position(x, y)]
	}
}
customElements.define('ui-element', UIElement, { extends: 'div' })

@Component(ecs)
export class TextElement extends HTMLSpanElement {
	constructor(text: string, fontSize: number = 1) {
		super()
		this.textContent = text
		this.style.pointerEvents = 'none'
		this.style.fontFamily = 'm5x7'
		this.style.fontSize = `${fontSize}em`
	}
}

customElements.define('text-element', TextElement, { extends: 'span' })

export const setDefaultFontSize = () => {
	document.body.style.fontSize = '30px'
}
