import type { StandardProperties } from 'csstype'
import { BattlerMenu, PlayerActionItem } from '@/stateBattle/battleActions'
import type { BattleAction } from '@/constants/actions'
import { assets, ecs } from '@/globals/init'
import { Interactable } from '@/lib/interactions'
import { BattleUI } from '@/ui/UiElement'
import { ChangeBorderOnSelected, Menu } from '@/ui/menu'
import { getMenuInputMap } from '@/menus/menuInputs'

const containerStyles: StandardProperties = { width: 'fit-content', height: 'fit-content', margin: '3vw', display: 'flex', gap: '1vw', padding: '1vh', placeItems: 'center' }

const characterCard = () => (
	<nineslice image={assets.ui.framebordered} scale={4} margin={4} style={containerStyles} components={[new BattleUI()]}>
		<ui-element>
			<nineslice image={assets.ui.label} margin={4} scale={4} style={{ display: 'flex', gap: '1vw' }}>
				<image image={assets.heroIcons.paladin} scale={3} />
				<text>Paladin</text>
			</nineslice>
			<text>Level 2</text>
		</ui-element>
		<ui-element>
			<ui-element>
				<text>HP 20/20</text>
				<image image={assets.ui.hpbar} scale={4} />
			</ui-element>
			<ui-element>
				<text>SP 20/20</text>
				<image image={assets.ui.hpbar} scale={4} />
			</ui-element>
		</ui-element>
	</nineslice>
)
export const actionMenu = (actions: readonly BattleAction<any>[]) => {
	const options = actions.map(action => (
		<nineslice
			image={assets.ui.itemspot}
			margin={3}
			scale={3}
			style={{ display: 'flex', placeItems: 'center', gap: '1vw' }}
			components={[new Interactable(), new ChangeBorderOnSelected(assets.ui['itemspot-selected']), new PlayerActionItem(action)]}
		>
			{action.icon ? <image image={action.icon} scale="2vw"></image> : null}
			<text>{action.label}</text>
		</nineslice>
	))
	return (
		<nineslice
			image={assets.ui.framebordered}
			margin={4}
			scale={4}
			style={{ display: 'grid', alignSelf: 'end', width: '10vw', margin: '3vw', gap: '1vh', padding: '1vh' }}
			components={[new Menu(options), getMenuInputMap(), new BattlerMenu(), new BattleUI()]}
		>
			{options}
		</nineslice>
	)
}

export const battleUi = () => {
	ecs.spawn(characterCard())
}
