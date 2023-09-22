import type { keys } from '@/constants/dialog'
import type { PlayerData } from '@/constants/players'
import type { direction } from '@/dungeon/spawnDungeon'

interface saveData {
	players: PlayerData[]
	lastDungeon: levels | null
	lastState: 'dungeon' | 'overworld' | 'battle'
	lastLevelIndex: number | null
	lastNodeUUID: string | null
	keys: Array<typeof keys[number]>
	lastDirection: direction | null
}

export const save: saveData = {
	players: [],
	keys: [],
	lastNodeUUID: null,
	lastDungeon: null,
	lastLevelIndex: null,
	lastState: 'overworld',
	lastDirection: null,

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
getSave()
