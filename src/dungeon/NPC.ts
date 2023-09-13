import { Collider, ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { Group } from 'three'
import { LDTKEntityInstance } from '../level/LDTKEntity'
import { PlayerInputMap } from './playerInputs'
import type { characterNames } from '@/constants/animations'
import { ecs } from '@/globals/init'
import type { Class } from '@/lib/ECS'
import { Component, Entity } from '@/lib/ECS'
import { world } from '@/lib/world'
import { Position } from '@/lib/transforms'
import type { EntityInstance, LayerInstance } from '@/level/LDTK'
import { assets } from '@/globals/assets'
import { textureAtlasBundle } from '@/lib/bundles'
import { dialog } from '@/constants/dialog'
import { TextElement, UIElement } from '@/ui/UiElement'
import { NineSlice } from '@/ui/NineSlice'

interface NPCLDTK {
	name: characterNames
}

@Component(ecs)
export class NPC extends LDTKEntityInstance<NPCLDTK> {}

@Component(ecs)
export class Dialog {
	#dialog: Generator
	current: string = ''
	constructor(dialogResolver: () => Generator) {
		this.#dialog = dialogResolver()
		this.step()
	}

	step() {
		this.current = this.#dialog.next().value
		return this.current
	}
}
export const NPCBundle = (entityInstance: EntityInstance, layerInstance: LayerInstance) => {
	const npc = new NPC(entityInstance)

	const components: InstanceType<Class>[] = [
		...textureAtlasBundle(assets.characters[npc.data.name], 'idle', 'left', 'down'),
		...npc.withPosition(layerInstance),
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
	for (const [entity, dialog] of addedDialogQuery.getAll()) {
		entity.spawn(new DialogArea(dialog), RigidBodyDesc.fixed(), ColliderDesc.ball(16).setSensor(true), new Position())
	}
}

const dialogAreasQuery = ecs.query.pick(Entity, Collider, DialogArea, Position)
const playerQuery = ecs.query.pick(PlayerInputMap, Collider)
export const startDialog = () => {
	for (const [playerInputs, playerCollider] of playerQuery.getAll()) {
		for (const [entity, collider, dialogArea, pos] of dialogAreasQuery.getAll()) {
			if (world.intersectionPair(playerCollider, collider)) {
				if (playerInputs.get('interact').justPressed) {
					if (!dialogArea.bubble) {
						const text = new TextElement(dialogArea.dialog.current)
						const bubble = entity
							.spawn(
								...new UIElement({ color: 'black' }).withWorldPosition(pos.x, pos.y + 8),
								new NineSlice(assets.ui.textbox.path, 4, 3),
							)
						bubble.spawn(text)
						dialogArea.bubble = bubble
						dialogArea.text = text
					} else if (dialogArea.text) {
						dialogArea.text.textContent = dialogArea.dialog.step()
					}
				}
			} else if (dialogArea.bubble) {
				dialogArea.bubble.despawn()
				dialogArea.bubble = null
			}
		}
	}
}
