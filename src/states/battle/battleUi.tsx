import type { StandardProperties } from 'csstype'
import type { Vec2 } from 'three'
import { Health } from './health'
import { BattlerMenu, PlayerActionItem } from '@/states/battle/battleActions'
import type { BattleAction } from '@/constants/actions'
import { assets, ecs } from '@/globals/init'
import { Interactable } from '@/lib/interactions'
import { BattleUI, UIElement } from '@/ui/UiElement'
import { ChangeBorderOnSelected, Menu } from '@/ui/menu'
import { getMenuInputMap } from '@/menus/menuInputs'
import { getOffscreenBuffer } from '@/utils/buffer'
import { Component } from '@/lib/ECS'

const containerStyles: StandardProperties = { width: 'fit-content', height: 'fit-content', margin: '3vw', display: 'flex', gap: '1vw', padding: '1vh', placeItems: 'center' }

export const getHealthBar = (amount: number, color: string) => {
	const buffer = getOffscreenBuffer(26, 1)
	buffer.fillStyle = color
	buffer.fillRect(0, 0, amount * 26, 1)
	return buffer.canvas
}
@Component(ecs)
export class PlayerHealthImage {
	public constructor(public entity: Entity) {}
}
@Component(ecs)
export class PlayerHealthText {
	public constructor(public entity: Entity) {}
}
const playerHealthImageQuery = ecs.query.pick(UIElement, PlayerHealthImage)
const playerHealthTextQuery = ecs.query.pick(UIElement, PlayerHealthText)
export const updatePlayerUi = () => {
	for (const [uiElement, parent] of playerHealthImageQuery.getAll()) {
		const health = parent.entity.getComponent(Health)
		if (health) {
			const healthPercent = health.currentHealth / health.maxHealth
			uiElement.setStyles({ width: `calc(${healthPercent * 26}px * 4)`, marginRight: `calc(${(1 - healthPercent) * 26 + 2}px * 4)`, marginLeft: `calc(2px * 4)`, marginTop: `calc(2px * 4)`, marginBottom: `calc(2px * 4)` })
		}
	}
	for (const [uiElement, parent] of playerHealthTextQuery.getAll()) {
		const health = parent.entity.getComponent(Health)
		if (health) {
			uiElement.text(`HP ${health.currentHealth}/20`)
		}
	}
}
export const displayHealth = (entity: Entity, worldPosition?: Vec2) => {
	return (
		<image
			image={assets.ui.hpbar}
			scale={4}
			worldPosition={worldPosition}
			style={{ display: 'grid', placeItems: 'center' }}
		>
			<image
				image={getHealthBar(1, '#17b81e')}
				scale={4}
				components={[new PlayerHealthImage(entity)]}
			>
			</image>
		</image>
	)
}
const characterCard = (player: Entity) => (
	<nineslice image={assets.ui.framebordered} scale={4} margin={4} style={containerStyles} components={[new BattleUI()]}>
		<ui-element>
			<nineslice image={assets.ui.label} margin={4} scale={4} style={{ display: 'flex', gap: '1vw' }}>
				<image image={assets.heroIcons.paladin} scale={3} />
				<text>Paladin</text>
			</nineslice>
		</ui-element>
		<ui-element>
			<ui-element>
				<text components={[new PlayerHealthText(player)]}>HP 20/20</text>
				{displayHealth(player)}
			</ui-element>
			<ui-element>
				<text>SP 20/20</text>
				<image image={assets.ui.hpbar} scale={4} style={{ display: 'grid', placeItems: 'center' }}>
					<image
						image={getHealthBar(1, '#4779d5')}
						style={{ maxWidth: 'calc(26px * 4)' }}
						scale={4}
					>
					</image>
				</image>
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
			style={{ display: 'grid', alignSelf: 'end', minWidth: '10vw', width: 'fit-content', margin: '3vw', gap: '1vh', padding: '1vh' }}
			components={[new Menu(options), getMenuInputMap(), new BattlerMenu(), new BattleUI()]}
		>
			{options}
		</nineslice>
	)
}

export const battleUi = (player: Entity) => ecs.spawn(characterCard(player))
