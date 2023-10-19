/// <reference lib="DOM" />

type UIElement = import('./ui/UiElement').UIElement

type Class = import('./lib/ECS').Class

type StandardProperties = import('csstype').StandardProperties

type Entity = import('./lib/ECS').Entity
declare namespace JSX {
	type Element = Entity
	type IntrinsicElements = {
		[k in keyof IntrinsicElementsMap]: IntrinsicElementsMap[k] & {
			components?: InstanceType<Class>[]
			style?: StandardProperties
			bind?: (UIElement) => void
			worldPosition?: { x: number;y: number }
		}
	}
	interface IntrinsicElementsMap {
		'nineslice': { image: HTMLCanvasElement;margin: number;scale?: number }
		'image': { image: HTMLCanvasElement | OffscreenCanvas;scale?: number | string }
		'ui-element': NonNullable<unknown>
		'text': { size?: number }
	}
}
