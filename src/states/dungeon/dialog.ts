import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Interactable } from '@/lib/interactions'
import { MenuInputInteractable } from '@/menus/menuInputs'
import { UIElement } from '@/ui/UiElement'
import { Menu, UnderlineOnSelected } from '@/ui/menu'

@Component(ecs)
export class Dialog {
	#dialog: Generator
	current?: string | string[]
	finished = false
	text: UIElement | null = null
	constructor(dialogResolver: () => Generator) {
		this.#dialog = dialogResolver()
	}

	step(index?: number) {
		const next = this.#dialog.next(index)
		this.current = next.value
		this.finished = next.done ?? true
		return this.current
	}

	withMenu() {
		return [this, new Menu()]
	}
}
@Component(ecs)
export class DialogOption {
	constructor(public index = 0) {}
}
@Component(ecs)
export class DialogContainer {
	constructor(public dialog?: Dialog) {}
}
export const dialogContainerQuery = ecs.query.pick(Entity, DialogContainer)
const dialogOptionsQuery = ecs.query.pick(Entity).with(DialogOption)
export const stepDialog = (dialog: Dialog, menu: Menu) => {
	const bubble = dialogContainerQuery.extract()
	if (bubble) {
		for (const [dialogOption] of dialogOptionsQuery.getAll()) {
			dialogOption.despawn()
		}
		const line = dialog.step(menu.selectedEntity?.getComponent(DialogOption)?.index ?? 0)
		if (line) {
			const lines = typeof line === 'string' ? [line] : line
			const boxes = lines.map((line, index) => {
				const box = bubble.spawn(new UIElement(), new MenuInputInteractable('Enter'), new Interactable(), new DialogOption(index))
				box.spawn(UIElement.text(line))
				return box
			}).filter(Boolean)
			if (boxes.length > 1) {
				for (const box of boxes) {
					box.addComponent(new UnderlineOnSelected())
				}
			}
			menu.entities = boxes
			menu.selectEntity(boxes[0])
		}
	}
}