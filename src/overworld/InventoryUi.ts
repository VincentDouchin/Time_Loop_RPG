import { items } from '@/constants/items'
import { assets, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Interactable, InteractableType } from '@/lib/interactions'
import { MenuInputInteractable, menuInputQuery } from '@/menus/menuInputs'
import { save } from '@/save/saveData'
import { NineSlice } from '@/ui/NineSlice'
import { UIElement } from '@/ui/UiElement'
import { toCanvas } from '@/utils/buffer'

@Component(ecs)
export class Inventory {}

export const spawnInventoryToggle = () => {
	ecs
		.spawn(
			UIElement.fromImage(assets.ui.inventory, 10).setStyles({ width: '10vh', height: '10vh', position: 'fixed', top: '10vh', left: '10vh', display: 'grid', placeItems: 'center' }),
			new Interactable(InteractableType.InventoryToggle),
			new MenuInputInteractable('Inventory'),

		)
}
const inventoryQuery = ecs.query.pick(Entity).with(Inventory)
export const openInventory = () => {
	for (const [inputs] of menuInputQuery.getAll()) {
		if (inputs.get('Inventory').justPressed) {
			if (inventoryQuery.size === 0) {
				ecs
					.spawn(
						new UIElement({ margin: '10vh 10vh 10vh 30vh', display: 'grid', gap: '5vh', gridTemplateColumns: 'repeat(6, 1fr)', width: 'fit-content', placeSelf: 'center' }), new NineSlice(assets.ui.frameBig.path, 16, 4)
						,
						new Inventory(),
					)
					.withChildren((inventory) => {
						for (let i = 0; i < 24; i++) {
							const spot = inventory.spawn(new UIElement({ width: '10vh', height: '10vh' }))
							const itemName = save.treasureFound[i]
							if (itemName) {
								const item = items[itemName]
								if (item.sprite) {
									spot.spawn(UIElement.fromCanvas(item.sprite, 6).setStyles({ display: 'grid', placeItems: 'center' }))
								}
							}
						}
					})
			} else {
				for (const [entity] of inventoryQuery.getAll()) {
					entity.despawn()
				}
			}
		}
	}
}
