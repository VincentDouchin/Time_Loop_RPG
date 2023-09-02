import { UIElement } from './UiElement'
import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'

import { Interactable } from '@/lib/interactions'
import { menuInputQuery } from '@/menus/menuInputs'

@Component(ecs)
export class Menu {
	selectedEntity: Entity | null = null
	entities: Entity[][] = []
	#active = true
	constructor(entities: Entity[][]) {
		this.entities = entities
		this.selectedEntity = entities[0][0]
		this.selectedEntity.addComponent(new Selected(this))
	}

	static fromRow(...entities: Entity[]) {
		return new Menu([entities])
	}

	static fromColumn(...entities: Entity[]) {
		return new Menu(entities.map(entity => [entity]))
	}

	set active(active: boolean) {
		this.#active = active
		if (!active) {
			this.selectedEntity?.removeComponent(Selected)
		}
	}

	clear() {
		for (const row of this.entities) {
			for (const entity of row) {
				entity.removeComponent(Selected)
			}
		}
	}

	get active() {
		return this.#active
	}

	selectEntity(newSelectedEntity: Entity) {
		if (this.selectedEntity !== newSelectedEntity) {
			this.selectedEntity?.removeComponent(Selected)
			this.selectedEntity = newSelectedEntity
			this.selectedEntity.addComponent(new Selected(this))
		}
	}

	selectEntityFromCoords(x = 0, y = 0) {
		const currentRow = this.entities.find(row => this.selectedEntity && row.includes(this.selectedEntity))!
		const currentRowIndex = this.entities.indexOf(currentRow)
		const currentColumn = this.selectedEntity ? currentRow.indexOf(this.selectedEntity) : 0
		const newSelectedEntity = this.entities.at((currentRowIndex + y) % this.entities.length)?.at((currentColumn + x) % currentRow.length)
		if (newSelectedEntity) {
			this.selectEntity(newSelectedEntity)
		}
	}

	isPartOfMenu(entity: Entity) {
		return this.entities.some(row => row.includes(entity))
	}
}

@Component(ecs)
export class Selected {
	constructor(public menu: Menu) {}
}
const menuQuery = ecs.query.pick(Menu)
const interactableQuery = ecs.query.pick(Entity, Interactable)
export const updateMenus = () => {
	for (const [menu] of menuQuery.getAll()) {
		if (menu.active) {
			for (const [entity, interactable] of interactableQuery.getAll()) {
				if (interactable.hover && menu.isPartOfMenu(entity)) {
					menu.selectEntity(entity)
				}
			}
			const menuInputs = menuInputQuery.extract()
			if (menuInputs) {
				if (menuInputs.get('Right').justPressed) {
					menu.selectEntityFromCoords(1, 0)
				}
				if (menuInputs.get('Left').justPressed) {
					menu.selectEntityFromCoords(-1, 0)
				}
				if (menuInputs.get('Up').justPressed) {
					menu.selectEntityFromCoords(0, 1)
				}
				if (menuInputs.get('Down').justPressed) {
					menu.selectEntityFromCoords(0, -1)
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

const selectedUiElement = ecs.query.pick(UIElement).added(Selected)
const unselectedUiElement = ecs.query.pick(UIElement).removed(Selected)
export const selectUiElement = () => {
	for (const [uiElement] of selectedUiElement.getAll()) {
		uiElement.setStyle('text-decoration', 'underline')
	}
	for (const [uiElement] of unselectedUiElement.getAll()) {
		uiElement.setStyle('text-decoration', 'none')
	}
}
