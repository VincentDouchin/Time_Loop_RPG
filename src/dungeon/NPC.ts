import { LDTKEntityInstance } from '../level/LDTKEntity'
import { PlayerInputMap } from './playerInputs'
import { dialog } from '@/constants/dialog'
import { assets, ecs } from '@/globals/init'
import type { EntityInstance, LayerInstance } from '@/level/LDTK'
import type { Class } from '@/lib/ECS'
import { Component, Entity } from '@/lib/ECS'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { NineSlice } from '@/ui/NineSlice'
import { TextElement, UIElement } from '@/ui/UiElement'
import { Menu } from '@/ui/menu'

interface NPCLDTK {
	name: characters
}

@Component(ecs)
export class NPC extends LDTKEntityInstance<NPCLDTK> {}

@Component(ecs)
export class Dialog {
	#dialog: Generator
	current?: string | string[]
	bubble: Entity | null = null
	text: TextElement | null = null
	constructor(dialogResolver: () => Generator) {
		this.#dialog = dialogResolver()
	}

	step(index?: number) {
		this.current = this.#dialog.next(index).value
		return this.current
	}
}
export const NPCBundle = (entityInstance: EntityInstance, layerInstance: LayerInstance) => {
	const npc = new NPC(entityInstance)
	const components: InstanceType<Class>[] = [
		...TextureAtlas.bundle(assets.characters[npc.data.name], 'idle', 'left', 'down'),
		npc,
		npc.position(layerInstance),
	]
	const npcDialog = dialog[npc.data.name]
	if (npcDialog) {
		components.push(new Dialog(npcDialog))
	}
	return components
}

@Component(ecs)
export class DialogArea {
	constructor(public dialog: Dialog, public bubble: Entity | null = null, public text: TextElement | null = null) {}
}

const addedDialogQuery = ecs.query.pick(Entity, Dialog).added(Dialog)
export const spawnDialogArea = () => {
	for (const [entity] of addedDialogQuery.getAll()) {
		entity.addComponent(new Menu())
	}
}

@Component(ecs)
export class DialogOption {
	constructor(public index = 0) {}
}

const dialogAreasQuery = ecs.query.pick(Entity, Position, Dialog, Menu)
const playerQuery = ecs.query.pick(PlayerInputMap, Position)
export const startDialog = () => {
	for (const [playerInputs, playerPosition] of playerQuery.getAll()) {
		for (const [entity, position, dialog, menu] of dialogAreasQuery.getAll()) {
			if (playerPosition.distanceTo(position) < 32) {
				if (playerInputs.get('interact').justPressed) {
					if (!dialog.bubble) {
						dialog.bubble = entity
							.spawn(
								...new UIElement({ color: 'black', display: 'grid', gap: '0.2rem', padding: '0.2rem' }).withWorldPosition(0, 8),
								new NineSlice(assets.ui.textbox.path, 4, 3),
							)
							.label('bubble')
					}
					dialog.bubble.despawnChildren()
					const line = dialog.step(menu.selectedEntity?.getComponent(DialogOption)?.index ?? 0)
					if (line) {
						const lines = typeof line === 'string' ? [line] : line
						const boxes = lines.map((line, index) => {
							if (dialog.bubble) {
								const box = dialog.bubble.spawn(new UIElement(), new DialogOption(index))
								box.spawn(new TextElement(line))
								return box
							}
							return null
						}).filter(Boolean)
						if (boxes.length > 1) {
							menu.fromColumn(...boxes)
						}
					} else {
						dialog.bubble.despawn()
						dialog.bubble = null
					}
				}
			} else if (dialog.bubble) {
				dialog.bubble.despawn()
				dialog.bubble = null
			}
		}
	}
}
