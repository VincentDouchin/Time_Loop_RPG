import { ecs } from '@/globals/init'
import { NineSlice } from '@/ui/NineSlice'
import { TextElement, UIElement } from '@/ui/UiElement'

export function createUiEntity<Element extends keyof JSX.IntrinsicElements>(
	tag: Element,
	attrs?: JSX.IntrinsicElements[Element],
	...children: (Entity | string)[]
): Entity {
	const entity = ecs.spawn()
	if (tag === 'ui-element') {
		const element = attrs?.image ? UIElement.fromImage(...attrs?.image) : new UIElement()
		if (attrs?.nineslice) {
			entity.addComponent(new NineSlice(...attrs.nineslice))
		}
		if (attrs?.style) {
			element.setStyles(attrs.style)
		}
		entity.addComponent(element)
	}
	for (const child of children) {
		if (typeof child === 'string') {
			entity.spawn(new TextElement(child))
		} else {
			entity.addChildren(child)
		}
	}
	return entity
}
