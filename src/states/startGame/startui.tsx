import { assets, ecs, startGame } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Interactable } from '@/lib/interactions'
import { getMenuInputMap } from '@/menus/menuInputs'
import { getSave } from '@/save/saveData'
import { ChangeBackgroundOnSelected, ChangeBorderOnSelected, Menu } from '@/ui/menu'

@Component(ecs)
export class StartGameUI {}
@Component(ecs)
export class DeleteGameMenu {}

const startGameUIQuery = ecs.query.pick(Menu).with(StartGameUI)
export const loadSave = () => {
	getSave()
	startGame.disable()
}
const deleteGameMenuQuery = ecs.query.pick(Entity).with(DeleteGameMenu)
const despawnDeleteGameMenu = () => {
	for (const [entity] of deleteGameMenuQuery) {
		entity.despawn()
	}
	for (const [menu] of startGameUIQuery.getAll()) {
		menu.active = true
	}
}
const deleteSave = () => {
	localStorage.removeItem('saveData0')
	getSave()
	despawnDeleteGameMenu()
}
const spawnDeleteSaveMenu = () => {
	for (const [menu] of startGameUIQuery.getAll()) {
		menu.active = false
	}
	const text = <text size={1.5}>Delete this save?</text>
	const yes = (
		<nineslice
			image={assets.ui.itemspot}
			scale={4}
			margin={4}

			components={[new Interactable().onClick(deleteSave), new ChangeBorderOnSelected(assets.ui['itemspot-selected'])]}
		>
			<text>Yes</text>
		</nineslice>
	)
	const no = (
		<nineslice
			image={assets.ui.itemspot}
			scale={4}
			margin={4}
			components={[new Interactable().onClick(despawnDeleteGameMenu), new ChangeBorderOnSelected(assets.ui['itemspot-selected'])]}
		>
			<text>No</text>
		</nineslice>
	)
	ecs.spawn((
		<nineslice
			image={assets.ui.frameornate}
			margin={12}
			scale={4}
			style={{ position: 'fixed', margin: 'auto', left: '50%', top: '50%', translate: '-50% -50%', textAlign: 'center', display: 'grid', gap: '2vh' }}
			components={[new Menu([yes, no]), getMenuInputMap(), new DeleteGameMenu()]}
		>
			{text}
			{yes}
			{no}
		</nineslice>
	))
}
export const spawnStartUi = () => {
	const existingSave = localStorage.getItem('saveData0')
	const load = (
		<nineslice
			image={assets.ui.itemspot}
			scale={4}
			margin={4}
			components={[new Interactable().onClick(loadSave), new ChangeBorderOnSelected(assets.ui['itemspot-selected'])]}
		>
			<text>{existingSave ? 'Continue' : 'New game' }</text>
		</nineslice>
	)

	const trash = (
		<image
			image={assets.uiAtlas.delete[0]}
			style={{ aspectRatio: 1, height: '60%' }}
			components={[new Interactable().onClick(spawnDeleteSaveMenu), new ChangeBackgroundOnSelected(assets.uiAtlas.delete[1])]}
		>
		</image>
	)

	ecs.spawn(
		<ui-element style={{ display: 'grid', gridTemplateRows: '1fr auto' }} components={[new StartGameUI(), new Menu([load, trash]), getMenuInputMap()]}>
			<image image={assets.ui.title} style={{ backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPositionX: '50%' }}></image>
			<nineslice
				image={assets.ui.frameornate}
				margin={12}
				scale={4}
				style={{ margin: '10vh auto', display: 'grid', gap: '2vh', gridTemplateColumns: '3fr 1fr', placeItems: 'center' }}
			>
				{load}
				{trash}
			</nineslice>
		</ui-element>,
	)
}