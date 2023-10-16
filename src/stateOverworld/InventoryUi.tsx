import { easing } from 'ts-easing'
import { items } from '@/constants/items'
import { assets, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Interactable } from '@/lib/interactions'
import { Tween } from '@/lib/tween'
import { MenuInputInteractable, menuInputQuery } from '@/menus/menuInputs'
import { save } from '@/save/saveData'
import { OverWorldUI, UIElement } from '@/ui/UiElement'
import { ChangeBackgroundOnSelected, Menu } from '@/ui/menu'
import { range } from '@/utils/mapFunctions'

@Component(ecs)
export class Inventory { }
@Component(ecs)
export class InventoryIcon { }

export const spawnInventoryToggle = () => {
	const bag = ecs
		.spawn(
			UIElement.fromImage(assets.ui.inventory, 10).setStyles({ width: '10vh', height: '10vh', position: 'fixed', top: '10vh', left: '10vh', display: 'grid', placeItems: 'center' }),
			new Interactable(),
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
const inventory = () => {
	const slots = range(0, 24, (i) => {
		const itemName = save.treasureFound[i]
		const item = items?.[itemName]
		return (
			<image
				image={assets.ui.itemspot}
				scale="15vh"
				style={{ display: 'grid', placeItems: 'center' }}
				components={[new ChangeBackgroundOnSelected(assets.ui['itemspot-selected']), new Interactable()]}
			>
				{
				item?.sprite
					? <image image={item.sprite} scale={6} style={{ display: 'grid', placeItems: 'center' }} />
					: null
			}
			</image>
		)
	})
	const moveDown = (element: UIElement) => new Tween(300).easing(easing.inOutExpo).onUpdate((r) => {
		element.setStyles({ translate: `0% ${r}%` })
	}, 200, 0)
	const inventory = (
		<nineslice
			bind={moveDown}
			image={assets.ui.frameornate}
			margin={8}
			scale={4}
			style={{ margin: '10vh 10vh 10vh 10vh', display: 'grid', gap: '0.5vh', gridTemplateColumns: 'repeat(6, 1fr)', width: 'fit-content', placeSelf: 'center' }}
			components={[new Inventory(), new Menu(slots)]}
		>
			{slots}
		</nineslice>
	)

	return inventory
}
export const inventoryQuery = ecs.query.pick(Entity, UIElement).with(Inventory)
export const openInventory = () => {
	for (const [inputs] of menuInputQuery.getAll()) {
		if (inputs.get('Inventory').justPressed) {
			if (inventoryQuery.size === 0) {
				ecs.spawn(inventory())
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
