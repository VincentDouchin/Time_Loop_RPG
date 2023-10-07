import { Cutscene } from './cutscenes'
import { dialog } from '@/constants/dialog'
import { BanditLeader } from '@/constants/enemies'
import { Dialog, stepDialog } from '@/dungeon/NPC'
import { ecs } from '@/globals/init'
import { Entity } from '@/lib/ECS'
import { menuInputQuery } from '@/menus/menuInputs'
import { dialogContainer } from '@/ui/dialogUi'
import { Menu } from '@/ui/menu'

const battlerDialogQuery = ecs.query.pick(Dialog, Menu)
const stepBattleDialog = () => {
	for (const [dialog, menu] of battlerDialogQuery.getAll()) {
		stepDialog(dialog, menu)
	}
}

export const battleDialog = () => {
	const menuInputs = menuInputQuery.extract()
	if (menuInputs?.get('Enter').justPressed) {
		stepBattleDialog()
	}
}

const banditLeaderQuery = ecs.query.pick(Entity, BanditLeader).without(Dialog)
export const banditCutscene = () => {
	if (banditLeaderQuery.size) {
		ecs.spawn(new Cutscene())
		for (const [leader] of banditLeaderQuery.getAll()) {
			if (dialog.banditLeader) {
				const dialogComponent = new Dialog(dialog.banditLeader)
				leader.addComponent(dialogComponent, new Menu())
				leader.addChildren(dialogContainer(dialogComponent))
				ecs.onNextTick(stepBattleDialog)
			}
		}
	}
}
