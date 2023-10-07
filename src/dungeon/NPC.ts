import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { LDTKEntityInstance } from '../level/LDTKEntity'
import { PlayerInputMap } from './playerInputs'
import { dialog } from '@/constants/dialog'
import { assets, ecs } from '@/globals/init'
import type { EntityInstance, LayerInstance } from '@/level/LDTK'
import type { Class } from '@/lib/ECS'
import { Component, Entity } from '@/lib/ECS'
import { Interactable } from '@/lib/interactions'
import { TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { MenuInputInteractable, menuInputQuery } from '@/menus/menuInputs'
import { UIElement } from '@/ui/UiElement'
import { dialogContainer } from '@/ui/dialogUi'
import { Menu, UnderlineOnSelected } from '@/ui/menu'

interface NPCLDTK {
	name: characters
}

@Component(ecs)
export class NPC extends LDTKEntityInstance<NPCLDTK> {}
@Component(ecs)
export class CanTalk {
	constructor(public entity: Entity | null = null) {}
}

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
export const NPCBundle = (entityInstance: EntityInstance, layerInstance: LayerInstance) => {
	const npc = new NPC(entityInstance)
	const bundle = TextureAtlas.bundle(assets.characters[npc.data.name], 'idle', 'left', 'down')
	bundle[0].setRenderOrder(9)
	const components: InstanceType<Class>[] = [
		...bundle,
		npc,
		npc.position(layerInstance),
		RigidBodyDesc.fixed(),
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
				const box = bubble.spawn(new UIElement(), new Interactable(), new DialogOption(index))
				box.spawn(UIElement.text(line))
				return box
			}).filter(Boolean)
			menu.entities.push(...boxes)
			if (boxes.length > 1) {
				for (const box of boxes) {
					box.addComponent(new UnderlineOnSelected())
				}
			}
		}
	}
}
export const startDialogDungeon = () => {
	for (const [playerInputs, playerPosition] of playerQuery.getAll()) {
		for (const [entity, position, dialog, menu] of dialogQuery.getAll()) {
			if (playerPosition.distanceTo(position) < 16) {
				if (!entity.getComponent(CanTalk) && !dialog.finished && !dialog.current) {
					entity.addComponent(new CanTalk())
				}
				const menuInputs = menuInputQuery.extract()
				if (playerInputs.get('interact').justReleased || menuInputs?.get('Enter').justReleased) {
					entity.removeComponent(CanTalk)
					if (!dialogContainerQuery.size) {
						entity.addChildren(dialogContainer(dialog))
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
				entity.removeComponent(CanTalk)
				for (const [entity, container] of dialogContainerQuery.getAll()) {
					if (container.dialog === dialog) {
						entity.despawn()
					}
				}
			}
		}
	}
}

const addedTalkQuery = ecs.query.pick(Entity, CanTalk, Dialog).added(CanTalk)
const removedTalkQuery = ecs.query.pick(CanTalk).removed(CanTalk)
const removedDialogQuery = ecs.query.pick(Entity, CanTalk).without(Dialog)
export const addTalkingIcon = () => {
	for (const [entity, canTalk] of addedTalkQuery.getAll()) {
		canTalk.entity = entity.spawn(
			...UIElement.fromImage(assets.ui.dialogIcon, 4).withWorldPosition(0, 8),
			new Interactable(),
			new MenuInputInteractable('Enter'),
		)
	}
	for (const [canTalk] of removedTalkQuery.getAll()) {
		canTalk.entity?.despawn()
	}
	for (const [entity, canTalk] of removedDialogQuery.getAll()) {
		canTalk.entity?.despawn()
		entity.removeComponent(CanTalk)
	}
}
