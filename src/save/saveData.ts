import type { keys } from '@/constants/dialog'
import type { PlayerData } from '@/constants/players'
import type { direction } from '@/dungeon/spawnDungeon'
import { overworldState } from '@/main'

interface saveData {
	players: PlayerData[]
	lastDungeon: levels | null
	lastState: 'dungeon' | 'overworld' | 'battle'
	lastLevelIndex: number | null
	lastNodeUUID: string | null
	keys: Array<typeof keys[number]>
	lastDirection: direction | null
	steps: number
}

export const save: saveData = {
	players: [],
	keys: [],
	lastNodeUUID: null,
	lastDungeon: null,
	lastLevelIndex: null,
	lastState: 'overworld',
	lastDirection: null,
	steps: 10,

}
export const saveToLocalStorage = () => {
	localStorage.setItem('saveData', JSON.stringify(save))
}

export const getSave = () => {
	const saveDataString = localStorage.getItem('saveData')
	if (saveDataString) {
		const saveData = JSON.parse(saveDataString) as saveData
		Object.assign(save, saveData)
	}
}
export const gameOver = () => {
	for (const player of save.players) {
		player.currentHealth = player.health
	}
	save.lastDirection = null
	save.lastNodeUUID = null
	save.steps = 10
	saveToLocalStorage()
	overworldState.disable()
	overworldState.enable()
}
getSave()
