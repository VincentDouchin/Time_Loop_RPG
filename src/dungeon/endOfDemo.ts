import { assets, ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Interactable } from '@/lib/interactions'
import { MenuInputInteractable, menuInputQuery } from '@/menus/menuInputs'
import { save, saveToLocalStorage } from '@/save/saveData'
import { NineSlice } from '@/ui/nineSlice'
import { UIElement } from '@/ui/UiElement'

@Component(ecs)
export class Thanks {}

export const showEndOfDemo = () => {
	if (save.lastBattle === 'BossBattleIntro' && save.lastState === 'battle') {
		save.finishedDemo = true
		saveToLocalStorage()
		ecs
			.spawn(
				new UIElement({ width: 'fit-content', height: 'fit-content', placeSelf: 'center', fontSize: '3rem', padding: '2rem', display: 'grid', textAlign: 'center', gap: '1rem' }),
				new NineSlice(assets.ui.frameornate, 8, 4),
				new Interactable(),
				new MenuInputInteractable('Enter'),
				new Thanks(),
			)
			.withChildren((root) => {
				[
					'Thanks for playing this demo!',
					'Please do tell me if you have any feedback',
				].forEach((text) => {
					root.spawn(UIElement.text(text))
				})
			})
	}
}
const thanksQuery = ecs.query.pick(Entity).with(Thanks)
export const hideThanks = () => {
	if (thanksQuery.size) {
		const menuInputs = menuInputQuery.extract()
		if (menuInputs?.get('Enter').justPressed) {
			thanksQuery.extract()?.despawn()
		}
	}
}
