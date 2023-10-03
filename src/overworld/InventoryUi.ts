import { easing } from 'ts-easing'
import { OverWorldUI } from './overworldUi'
import { items } from '@/constants/items'
import { assets, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Interactable, InteractableType } from '@/lib/interactions'
import { Tween } from '@/lib/tween'
import { MenuInputInteractable, menuInputQuery } from '@/menus/menuInputs'
import { save } from '@/save/saveData'
import { NineSlice } from '@/ui/NineSlice'
import { UIElement } from '@/ui/UiElement'

@Component(ecs)
export class Inventory { }
@Component(ecs)
export class InventoryIcon { }

export const spawnInventoryToggle = () => {
	const bag = ecs
		.spawn(
			UIElement.fromImage(assets.ui.inventory, 10).setStyles({ width: '10vh', height: '10vh', position: 'fixed', top: '10vh', left: '10vh', display: 'grid', placeItems: 'center' }),
			new Interactable(InteractableType.InventoryToggle),
			new MenuInputInteractable('Inventory'),
			new OverWorldUI(),
			new InventoryIcon(),
		)
	ecs.onNextTick(() => {
		const menuInputMap = menuInputQuery.extract()
		if (menuInputMap) {
			const bundle = UIElement.inputIcon(menuInputMap.get('Inventory'))
			bundle[0].setStyles({ position: 'absolute', right: '5%', bottom: '5%', width: '5vh', height: '5vh' })
			bag.spawn(...bundle)
		}
	})
}
const inventoryQuery = ecs.query.pick(Entity, UIElement).with(Inventory)
export const openInventory = () => {
	for (const [inputs] of menuInputQuery.getAll()) {
		if (inputs.get('Inventory').justPressed) {
			if (inventoryQuery.size === 0) {
				const inventoryElement = new UIElement({ margin: '10vh 10vh 10vh 10vh', display: 'grid', gap: '0.5vh', gridTemplateColumns: 'repeat(6, 1fr)', width: 'fit-content', placeSelf: 'center' })
				ecs
					.spawn(
						inventoryElement,
						new NineSlice(assets.ui.frameornate, 8, 4),
						new Inventory(),
					)
					.withChildren((inventory) => {
						for (let i = 0; i < 24; i++) {
							const spot = inventory.spawn(
								UIElement
									.fromImage(assets.ui.itemspot)
									.setStyles({ width: '15vh', height: '15vh', display: 'grid', placeItems: 'center' }),
							)
							const itemName = save.treasureFound[i]
							if (itemName) {
								const item = items[itemName]
								if (item.sprite) {
									spot.spawn(UIElement.fromImage(item.sprite, 6).setStyles({ display: 'grid', placeItems: 'center' }))
								}
							}
						}
					})
				new Tween(300).easing(easing.inOutExpo).onUpdate((r) => {
					inventoryElement.setStyles({ translate: `0% ${r}%` })
				}, 200, 0)
			} else {
				for (const [entity, inventoryElement] of inventoryQuery.getAll()) {
					new Tween(300).easing(easing.inOutExpo).onUpdate((r) => {
						inventoryElement.setStyles({ translate: `0% ${r}%` })
					}, 0, 200).onComplete(() => entity.despawn())
				}
			}
		}
	}
}
