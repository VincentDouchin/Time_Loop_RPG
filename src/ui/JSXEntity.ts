import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { ecs } from '@/globals/init'
import { Entity } from '@/lib/ECS'
import { Position } from '@/lib/transforms'
import { NineSlice } from '@/ui/nineSliceUi'
import { UIElement } from '@/ui/UiElement'

export function createUiEntity<Element extends keyof JSX.IntrinsicElements>(
	tag: Element,
	attrs?: JSX.IntrinsicElements[Element],
	...children: (Entity | string)[]
): Entity {
	const entity = ecs.spawn()
	const element = new UIElement()
	entity.addComponent(element)
	if (attrs?.components) {
		entity.addComponent(...attrs.components)
	}
	if (tag === 'nineslice') {
		const a = attrs as JSX.IntrinsicElements['nineslice']
		entity.addComponent(new NineSlice(a.image, a.margin, a.scale))
	}
	if (tag === 'image') {
		const a = attrs as JSX.IntrinsicElements['image']
		element?.setImage(a.image, a.scale)
	}
	let text = ''
	for (const child of children) {
		if (typeof child === 'string') {
			text += child
		} else if (Array.isArray(child)) {
			for (const subChild of child) {
				if (subChild instanceof Entity) {
					entity.addChildren(subChild)
				}
			}
		}
	}
	if (tag === 'text') {
		const a = attrs as JSX.IntrinsicElements['text']
		element.text(text, a?.size)
	}
	if (attrs?.bind && element) {
		attrs.bind(element)
	}
	if (attrs?.style && element) {
		element.setStyles(attrs.style)
	}

	if (attrs?.worldPosition) {
		entity.addComponent(new Position(attrs.worldPosition.x, attrs.worldPosition.y), new CSS2DObject(element))
	}
	for (const child of children) {
		if (child instanceof Entity) {
			entity.addChildren(child)
		}
	}
	return entity
}
