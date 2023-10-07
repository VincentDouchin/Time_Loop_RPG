import type { battles } from '@/constants/battles'
import { type keys, removeKeys } from '@/constants/dialog'
import type LDTKEnums from '@/constants/exports/LDTKEnums'
import type { PlayerData } from '@/constants/players'
import type { direction } from '@/dungeon/spawnDungeon'
import { overworldState } from '@/main'

type states = 'dungeon' | 'overworld' | 'battle'
interface saveData {
	finishedDemo: boolean
	players: PlayerData[]
	lastDungeon: levels | null
	lastBattle: keyof typeof battles | null
	lastState: states
	lastLevelIndex: number | null
	lastNodeUUID: string | null
	keys: Array<typeof keys[number]>
	lastDirection: direction | null
	steps: number
	treasureFound: (typeof LDTKEnums['treasure'][number])[]
}

export const save: saveData = {
	finishedDemo: false,
	lastBattle: null,
	players: [],
	keys: [],
	lastNodeUUID: null,
	lastDungeon: null,
	lastLevelIndex: null,
	lastState: 'overworld',
	lastDirection: null,
	steps: 17,
	treasureFound: [],

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
	save.steps = 17
	removeKeys('splitLog')
	saveToLocalStorage()
	overworldState.disable()
	overworldState.enable()
}
getSave()
