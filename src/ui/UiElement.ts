import type { StandardProperties } from 'csstype'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { assets, ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import type { Input } from '@/lib/inputs'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { getScreenBuffer, toCanvas } from '@/utils/buffer'

@Component(ecs)
export class OverWorldUI {}
@Component(ecs)
export class BattleUI {}
@Component(ecs)
export class InputIcon {
	constructor(public input: Input) {}
}

@Component(ecs)
export class UIElement extends HTMLDivElement {
	static font: fonts = 'm5x7'
	constructor(styles: StandardProperties = {}) {
		super()
		this.setStyles(styles)
	}

	setStyle<K extends keyof StandardProperties>(key: K, value: StandardProperties[K]) {
		(<any> this.style)[key] = value
		return this
	}

	setStyles(styles: StandardProperties) {
		for (const [key, val] of Object.entries(styles) as [keyof StandardProperties, any]) {
			this.style[key] = val
		}
		return this
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
		return [this, new CSS2DObject(this), new Position(x, y)] as const
	}

	setImage(image: HTMLCanvasElement | OffscreenCanvas, size?: number | string) {
		this.setStyles({
			imageRendering: 'pixelated',
			backgroundSize: 'cover',
		})
		const canvas = image instanceof OffscreenCanvas ? toCanvas(image) : image
		this.setStyle('backgroundImage', `url(${canvas.toDataURL()})`)
		if (size) {
			let finalWidth = `${image.width}px`
			let finalHeight = `${image.height}px`
			if (typeof size === 'number') {
				finalWidth = `${image.width * size}px`
				finalHeight = `${image.height * size}px`
			} else if (typeof size === 'string') {
				finalWidth = size
				finalHeight = size
			}
			this.setStyles({
				width: finalWidth,
				height: finalHeight,
			})
		}
		return this
	}

	static fromImage(source: HTMLCanvasElement | OffscreenCanvas, size?: number | string) {
		return new UIElement().setImage(source, size)
	}

	static inputIcon(input: Input) {
		const img = assets.inputs('keyboard', input.codes[0]) ?? getScreenBuffer(16, 16).canvas
		return [UIElement.fromImage(img), new InputIcon(input)] as const
	}

	text(text: string, size = 1) {
		this.setStyles({ pointerEvents: 'none', fontFamily: UIElement.font, fontSize: `${size}em` })
		this.textContent = text
		return this
	}

	static text(text: string, size = 1) {
		return new UIElement().text(text, size)
	}
}
customElements.define('ui-element', UIElement, { extends: 'div' })

export const setDefaultFontSize = () => {
	document.body.style.fontSize = '30px'
}
