import type { Properties, StandardProperties } from 'csstype'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { Position } from '@/lib/transforms'

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

	static fromImage({ path, width, height }: { path: string; width: number; height: number }, scale = 1) {
		return new UIElement({
			backgroundImage: `url(${path})`,
			width: `${width * scale}px`,
			height: `${height * scale}px`,
			imageRendering: 'pixelated',
			backgroundSize: 'cover',
		})
	}

	withWorldPosition(x = 0, y = 0) {
		return [this, new CSS2DObject(this), new Position(x, y)]
	}
}
customElements.define('ui-element', UIElement, { extends: 'div' })

@Component(ecs)
export class TextElement extends HTMLSpanElement {
	constructor(text: string) {
		super()
		this.textContent = text
		this.style.pointerEvents = 'none'
		this.style.fontFamily = 'm5x7'
	}
}

customElements.define('text-element', TextElement, { extends: 'span' })

export const setDefaultFontSize = () => {
	document.body.style.fontSize = '30px'
}
