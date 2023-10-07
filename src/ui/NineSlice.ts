import { UIElement } from './UiElement'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'

// const shader = new ShaderMaterial({ vertexShader, fragmentShader })

export type margins = number | { x: number; y: number } | { top: number; bottom: number; right: number; left: number }

const getMargins = (margins: margins) => {
	if (typeof margins === 'number') {
		return { left: margins, right: margins, top: margins, bottom: margins }
	} else if ('x' in margins) {
		return { top: margins.y, bottom: margins.y, left: margins.x, right: margins.x }
	} else {
		return margins
	}
}

@Component(ecs)
export class NineSlice {
	margins: { left: number; right: number; top: number; bottom: number }
	constructor(public image: HTMLCanvasElement, margins: margins, public scale = 1) {
		this.margins = getMargins(margins)
	}

	update(element: UIElement) {
		const allMargins = [this.margins.top, this.margins.right, this.margins.left, this.margins.bottom]
		element.setStyles({
			borderImage: `url(${this.image.toDataURL()}) round`,
			borderImageSlice: `${allMargins.join(' ')} fill`,
			borderImageRepeat: 'round',
			imageRendering: 'pixelated',
			borderWidth: allMargins.map(border => `${border * this.scale}px`).join(' '),
			borderStyle: 'solid',
		})
	}
}

const ninesliceUIQuery = ecs.query.pick(UIElement, NineSlice).added(NineSlice)

export const addNineSlicetoUI = () => {
	for (const [uiElement, nineSlice] of ninesliceUIQuery.getAll()) {
		nineSlice.update(uiElement)
	}
}
