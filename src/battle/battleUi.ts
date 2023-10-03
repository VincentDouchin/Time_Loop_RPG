import { assets, ecs } from '@/globals/init'
import { NineSlice } from '@/ui/NineSlice'
import { UIElement } from '@/ui/UiElement'

export const spawnBattleUi = () => {
	ecs.spawn(new UIElement({ width: '30vh', height: '20vh' }), new NineSlice(assets.ui.framebordered, { left: 12, right: 6, top: 6, bottom: 6 }, 4))
	// ecs.spawn(
	// 	new UIElement({ width: '50%', height: '50px', alignSelf: 'end', justifySelf: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr', placeItems: 'center' }),
	// 	new NineSlice(assets.ui.frameornate, 8, 4),
	// 	new BattlerMenu(),
	// 	new DialogContainer(),
	// 	new Interactable(),
	// 	new MenuInputInteractable('Enter'),
	// )
}
