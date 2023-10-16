import { BanditLeader } from './enemyTags'
import { dialog } from '@/constants/dialogs'
import { ecs } from '@/globals/init'
import { Component, Entity } from '@/lib/ECS'
import { Dialog } from '@/stateDungeon/dialog'
import { Menu } from '@/ui/menu'
import { dialogContainer } from '@/ui/dialogUi'

@Component(ecs)
export class Cutscene {}
const banditLeaderQuery = ecs.query.pick(Entity, BanditLeader).without(Dialog)
export const banditCutscene = () => {
	if (banditLeaderQuery.size) {
		ecs.spawn(new Cutscene())
		for (const [leader] of banditLeaderQuery.getAll()) {
			if (dialog.banditLeader) {
				const dialogComponent = new Dialog(dialog.banditLeader)
				leader.addComponent(dialogComponent, new Menu())
				leader.addChildren(dialogContainer(dialogComponent))
			}
		}
	}
}
