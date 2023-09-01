import type { Properties, StandardProperties, StandardPropertiesHyphen } from 'csstype'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { Position } from '@/lib/transforms'

@Component(ecs)
export class UIElement extends HTMLDivElement {
	constructor(style: StandardProperties = {}) {
		super()
		for (const [key, val] of Object.entries(style) as [keyof Properties, any]) {
			this.style[key] = val
		}
	}

	setStyle<K extends keyof StandardPropertiesHyphen>(key: K, value: StandardPropertiesHyphen[K]) {
		(<any> this.style)[key] = value
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
	}
}
customElements.define('text-element', TextElement, { extends: 'span' })
