import { UIElement } from './UiElement'
import { NineSlice } from './nineSlice'
import type { direction } from '@/dungeon/spawnDungeon'
import { ecs } from '@/globals/init'
import { Component, Entity, SystemSet } from '@/lib/ECS'

import { Interactable } from '@/lib/interactions'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { MenuInputMap } from '@/menus/menuInputs'

@Component(ecs)
export class Menu {
	selectedEntity: Entity | null = null
	entities: (Entity | null)[] = []
	#active = true
	constructor(entities: (Entity | null)[] = []) {
		this.entities = entities
		this.selectEntity(this.entities?.[0])
	}

	set active(active: boolean) {
		this.#active = active
		if (!active) {
			this.selectedEntity?.removeComponent(Selected)
		} else {
			this.selectedEntity?.addComponent(new Selected(this))
		}
	}

	clear() {
		for (const entity of this.entities) {
			entity?.removeComponent(Selected)
		}
	}

	get active() {
		return this.#active
	}

	selectEntity(newSelectedEntity?: Entity | null) {
		if (newSelectedEntity && this.selectedEntity !== newSelectedEntity) {
			this.selectedEntity?.removeComponent(Selected)
			this.selectedEntity = newSelectedEntity
			this.selectedEntity.addComponent(new Selected(this))
		}
	}

	isPartOfMenu(entity: Entity) {
		return this.entities.includes(entity)
	}
}

@Component(ecs)
export class Selected {
	constructor(public menu: Menu) {}
}
const menuQuery = ecs.query.pick(Menu, MenuInputMap)
const interactableQuery = ecs.query.pick(Entity, Interactable)

const findClosest = (entity: Entity | null, neighbors: (Entity | null)[]) => (direction: direction) => {
	if (entity) {
		const element = entity.getComponent(Interactable)
		if (element) {
			let closest: null | Entity = null
			let distance: null | number = null

			let elementX = element.position.x
			let elementY = element.position.y
			if (direction === 'left') {
				elementX -= element.dimensions.x / 2
			} else if (direction === 'right') {
				elementX += element.dimensions.x / 2
			} else if (direction === 'up') {
				elementY -= element.dimensions.y / 2
			} else if (direction === 'down') {
				elementY += element.dimensions.y / 2
			}
			for (const neighbor of neighbors) {
				if (neighbor) {
					const neighborElement = neighbor.getComponent(Interactable)
					if (neighborElement && neighborElement !== element) {
						const distanceToElement = (elementX - neighborElement.position.x) ** 2 + (elementY - neighborElement.position.y) ** 2
						let isInDirection = false
						if (direction === 'down') {
							isInDirection = elementY < neighborElement.position.y
						}
						if (direction === 'up') {
							isInDirection = elementY > neighborElement.position.y
						}
						if (direction === 'right') {
							isInDirection = elementX < neighborElement.position.x
						}
						if (direction === 'left') {
							isInDirection = elementX > neighborElement.position.x
						}
						if ((distance === null || distanceToElement < distance) && isInDirection) {
							distance = distanceToElement
							closest = neighbor
						}
					}
				}
			}
			return closest
		}
	}
}

export const updateMenus = () => {
	for (const [menu, menuInputs] of menuQuery.getAll()) {
		if (menu.active) {
			for (const [entity, interactable] of interactableQuery.getAll()) {
				if (interactable.hover && menu.isPartOfMenu(entity)) {
					menu.selectEntity(entity)
				}
			}
			const find = findClosest(menu.selectedEntity, menu.entities)
			if (menuInputs) {
				if (menuInputs.get('Right').justPressed) {
					menu.selectEntity(find('right'))
				}
				if (menuInputs.get('Left').justPressed) {
					menu.selectEntity(find('left'))
				}
				if (menuInputs.get('Up').justPressed) {
					menu.selectEntity(find('up'))
				}
				if (menuInputs.get('Down').justPressed) {
					menu.selectEntity(find('down'))
				}
				if (menuInputs.get('Enter').justPressed) {
					const interactable = menu.selectedEntity?.getComponent(Interactable)
					if (interactable) {
						interactable.pressed = true
					}
				}
			}
		}
	}
}
const despawnedMenusQuery = ecs.query.pick(Menu).removed(Menu)
export const unSelectDespawnMenus = () => {
	for (const [menu] of despawnedMenusQuery.getAll()) {
		menu.clear()
	}
}

@Component(ecs)
export class UnderlineOnSelected {}

const selectedUiElement = ecs.query.pick(UIElement).with(UnderlineOnSelected).added(Selected)
const unselectedUiElement = ecs.query.pick(UIElement).with(UnderlineOnSelected).removed(Selected)
const selectUiElement = () => {
	for (const [uiElement] of selectedUiElement.getAll()) {
		uiElement.setStyles({ textDecoration: 'underline' })
	}
	for (const [uiElement] of unselectedUiElement.getAll()) {
		uiElement.setStyles({ textDecoration: 'none' })
	}
}

@Component(ecs)
export class IncrementOnSelected {}

const selectedAtlasQuery = ecs.query.pick(Interactable, TextureAtlas, Sprite).with(IncrementOnSelected)

const changeTextureOnSelected = () => {
	for (const [interactable, atlas, sprite] of selectedAtlasQuery.getAll()) {
		const initialIndex = atlas.index
		if (interactable.hover) {
			atlas.index = 1
		} else {
			atlas.index = 0
		}
		if (initialIndex !== atlas.index) {
			sprite.composer.setInitialTexture(atlas.currentTexture)
		}
	}
}

@Component(ecs)
export class ChangeBackgroundOnSelected {
	initial?: string
	constructor(public background: HTMLCanvasElement) {}
}

const selectedBackgroundQuery = ecs.query.pick(UIElement, ChangeBackgroundOnSelected).added(Selected).without(NineSlice)
const unselectedBackgroundQuery = ecs.query.pick(UIElement, ChangeBackgroundOnSelected).removed(Selected).without(NineSlice)

const changeBackgroundOnSelected = () => {
	for (const [element, background] of selectedBackgroundQuery.getAll()) {
		background.initial = element.style.backgroundImage
		element.setImage(background.background)
	}
	for (const [element, background] of unselectedBackgroundQuery.getAll()) {
		if (background.initial) {
			element.setStyle('backgroundImage', background.initial)
		}
	}
}
@Component(ecs)
export class ChangeBorderOnSelected {
	initial?: HTMLCanvasElement
	constructor(public background: HTMLCanvasElement) {}
}

const selectedBorderQuery = ecs.query.pick(UIElement, ChangeBorderOnSelected, NineSlice).added(Selected)
const unselectedBorderQuery = ecs.query.pick(UIElement, ChangeBorderOnSelected, NineSlice).removed(Selected)

const changeBorderOnSelected = () => {
	for (const [element, background, nineSlice] of selectedBorderQuery.getAll()) {
		background.initial = nineSlice.image
		nineSlice.image = background.background
		nineSlice.update(element)
	}
	for (const [element, background, nineSlice] of unselectedBorderQuery.getAll()) {
		if (background.initial) {
			nineSlice.image = background.initial
			nineSlice.update(element)
		}
	}
}
export const selectEntities = SystemSet(changeBackgroundOnSelected, changeBorderOnSelected, changeTextureOnSelected, selectUiElement)
