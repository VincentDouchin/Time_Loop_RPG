import { UIElement } from './UiElement'
import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'

import { Interactable } from '@/lib/interactions'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { menuInputQuery } from '@/menus/menuInputs'

@Component(ecs)
export class Menu {
	selectedEntity: Entity | null = null
	entities: (Entity | null)[][] = []
	#active = true
	constructor(entities: (Entity | null)[][] = []) {
		this.entities = entities
		this.selectEntity(this.entities?.[0]?.[0])
	}

	static fromRow(...entities: Entity[]) {
		return new Menu().fromRow(...entities)
	}

	fromRow(...entities: Entity[]) {
		this.entities = [entities]
		this.selectEntity(this.entities?.[0]?.[0])
		return this
	}

	static fromColumn(...entities: Entity[]) {
		return new Menu().fromColumn(...entities)
	}

	fromColumn(...entities: Entity[]) {
		this.entities = entities.map(entity => [entity])
		this.selectEntity(this.entities?.[0]?.[0])
		return this
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
		for (const row of this.entities) {
			for (const entity of row) {
				entity?.removeComponent(Selected)
			}
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

	selectEntityFromCoords(x = 0, y = 0) {
		const currentRow = this.entities.find(row => this.selectedEntity && row.includes(this.selectedEntity)) ?? this.entities[0]
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

@Component(ecs)
export class UnderlineOnSelected {}

const selectedUiElement = ecs.query.pick(UIElement).with(UnderlineOnSelected).added(Selected)
const unselectedUiElement = ecs.query.pick(UIElement).with(UnderlineOnSelected).removed(Selected)
export const selectUiElement = () => {
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

export const changeTextureOnSelected = () => {
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
