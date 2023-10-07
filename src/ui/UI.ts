import { Group } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { UIElement } from './UiElement'
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
const UIRootQuery = ecs.query.pick(UIElement).with(UIRoot)
const removedUiElements = ecs.query.pick(UIElement).removed(UIElement)
export const addUIElementsToDOM = () => {
	const root = UIRootQuery.extract()
	if (root) {
		for (const [entity, uiElement] of uiElementQuery.getAll()) {
			if (entity.parent?.getComponent(Group) && !entity.parent?.getComponent(CSS2DObject)) {
				entity.addComponent(new CSS2DObject(uiElement))
			}

			const parent = entity.parent?.getComponent(UIElement) ?? root
			parent.appendChild(uiElement)
		}
	}
	for (const [uiElement] of removedUiElements.getAll()) {
		uiElement.remove()
	}
}
