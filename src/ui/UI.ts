import { Group } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { TextElement, UIElement } from './UiElement'
import { Component, Entity } from '@/lib/ECS'
import { ecs } from '@/globals/init'

@Component(ecs)
export class UIRoot {}

export const spawnUIRoot = () => {
	const element = new UIElement({ position: 'fixed', inset: '0', display: 'grid' })
	document.body.appendChild(element)
	ecs.spawn(new UIRoot(), element)
}

const uiElementQuery = ecs.query.pick(Entity, UIElement).added(UIElement).without(UIRoot).without(CSS2DObject)
const uiTextElementQuery = ecs.query.pick(Entity, TextElement).added(TextElement).without(UIRoot)
const UIRootQuery = ecs.query.pick(UIElement).with(UIRoot)
export const addUIElementsToDOM = () => {
	const root = UIRootQuery.extract()
	if (root) {
		for (const [entity, uiElement] of uiElementQuery.getAll()) {
			if (entity.parent?.getComponent(Group)) {
				entity.addComponent(new CSS2DObject(uiElement))
			} else {
				const parent = entity.parent?.getComponent(UIElement) ?? root
				parent.appendChild(uiElement)
			}
		}
		for (const [entity, textElement] of uiTextElementQuery.getAll()) {
			const parent = entity.parent?.getComponent(UIElement) ?? root
			parent.appendChild(textElement)
		}
	}
}
