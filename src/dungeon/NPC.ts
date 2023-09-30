import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
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
	text: TextElement | null = null
	constructor(dialogResolver: () => Generator) {
		this.#dialog = dialogResolver()
	}

	step(index?: number) {
		this.current = this.#dialog.next(index).value
		return this.current
	}

	withMenu() {
		return [this, new Menu()]
	}
}
export const NPCBundle = (entityInstance: EntityInstance, layerInstance: LayerInstance) => {
	const npc = new NPC(entityInstance)
	const components: InstanceType<Class>[] = [
		...TextureAtlas.bundle(assets.characters[npc.data.name], 'idle', 'left', 'down'),
		npc,
		npc.position(layerInstance),
		RigidBodyDesc.fixed().lockRotations(),
		ColliderDesc.cuboid(4, 4),
	]
	const npcDialog = dialog[npc.data.name]
	if (npcDialog) {
		components.push(...new Dialog(npcDialog).withMenu())
	}
	return components
}

@Component(ecs)
export class DialogOption {
	constructor(public index = 0) {}
}
@Component(ecs)
export class DialogContainer {
	constructor(public dialog?: Dialog) {}
}
const dialogQuery = ecs.query.pick(Entity, Position, Dialog, Menu)
const dialogContainerQuery = ecs.query.pick(Entity, DialogContainer)
const playerQuery = ecs.query.pick(PlayerInputMap, Position)
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
				const box = bubble.spawn(new UIElement(), new DialogOption(index))
				box.spawn(new TextElement(line))
				return box
			}).filter(Boolean)
			if (boxes.length > 1) {
				menu.fromColumn(...boxes)
			}
		}
	}
}

export const startDialogDungeon = () => {
	for (const [playerInputs, playerPosition] of playerQuery.getAll()) {
		for (const [entity, position, dialog, menu] of dialogQuery.getAll()) {
			if (playerPosition.distanceTo(position) < 16) {
				if (playerInputs.get('interact').justPressed) {
					if (!dialogContainerQuery.size) {
						entity.spawn(
							...new UIElement({ color: 'black', display: 'grid', gap: '0.2rem', padding: '0.2rem' }).withWorldPosition(0, 8),
							new NineSlice(assets.ui.textbox, 4, 3),
							new DialogContainer(dialog),
						)
					}
					ecs.onNextTick(() => stepDialog(dialog, menu))
				}
				if (!dialog.current) {
					for (const [entity, container] of dialogContainerQuery.getAll()) {
						if (container.dialog === dialog) {
							entity.despawn()
						}
					}
				}
			} else {
				for (const [entity, container] of dialogContainerQuery.getAll()) {
					if (container.dialog === dialog) {
						entity.despawn()
					}
				}
			}
		}
	}
}
