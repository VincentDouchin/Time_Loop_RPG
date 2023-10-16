import { BanditLeader } from './enemyTags'
import { Cutscene } from './cutscene'
import { dialog } from '@/constants/dialogs'
import { Dialog, dialogContainerQuery, stepDialog } from '@/stateDungeon/dialog'
import { ecs } from '@/globals/init'
import { Entity } from '@/lib/ECS'
import { menuInputQuery } from '@/menus/menuInputs'
import { dialogContainer } from '@/ui/dialogUi'
import { Menu } from '@/ui/menu'

const battlerDialogQuery = ecs.query.pick(Dialog, Menu)
const stepBattleDialog = () => {
	for (const [dialog, menu] of battlerDialogQuery.getAll()) {
		stepDialog(dialog, menu)
		if (!dialog.current) {
			for (const [containerEntity] of dialogContainerQuery.getAll()) {
				containerEntity.despawn()
			}
		}
	}
}

export const battleDialog = () => {
	const menuInputs = menuInputQuery.extract()
	if (menuInputs?.get('Enter').justPressed) {
		stepBattleDialog()
	}
}
