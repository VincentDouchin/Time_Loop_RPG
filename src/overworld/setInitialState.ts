import { players } from '@/constants/players'
import { dungeonState, overworldState } from '@/main'
import { save } from '@/save/saveData'

export const setInitialState = () => {
	if (save.lastState === 'dungeon' && save.lastDungeon && save.lastLevelIndex !== null && save.lastDirection) {
		dungeonState.enable(save.lastDungeon, save.lastLevelIndex, save.lastDirection)
	}
	if (save.lastState === 'overworld') {
		overworldState.enable()
	}
	if (save.players.length === 0) {
		save.players.push(players.paladin)
	}
}
