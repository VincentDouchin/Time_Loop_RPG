import { ecs } from '@/globals/init'
import { menuInputQuery } from '@/menus/menuInputs'
import { Dialog, dialogContainerQuery, stepDialog } from '@/stateDungeon/dialog'
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
