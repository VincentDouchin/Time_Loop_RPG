import type { battles } from '@/constants/battles'
import { type keys, removeKeys } from '@/constants/dialogs'
import type LDTKEnums from '@/constants/exports/LDTKEnums'
import type { PlayerData } from '@/constants/players'
import { overworldState } from '@/globals/init'
import type { direction } from '@/states/dungeon/spawnDungeon'

type states = 'dungeon' | 'overworld' | 'battle'
type Treasure = (typeof LDTKEnums['treasure'][number])
interface saveData {
	finishedDemo: boolean
	players: PlayerData[]
	money: number
	lastDungeon: levels | null
	lastBattle: keyof typeof battles | null
	lastState: states
	lastLevelIndex: number | null
	lastNodeUUID: string | null
	keys: Array<typeof keys[number]>
	lastDirection: direction | null
	steps: number
	treasureFound: Treasure[]
}

export const save: saveData = {
	finishedDemo: false,
	lastBattle: null,
	money: 0,
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
	localStorage.setItem(`saveData0`, JSON.stringify(save))
}

export const getSave = () => {
	const saveDataString = localStorage.getItem('saveData0')
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
export const addTreasure = (treasure: Treasure) => {
	if (!save.treasureFound.includes(treasure)) {
		save.treasureFound.push(treasure)
	}
}
export const removeTreasure = (treasure: Treasure) => {
	if (save.treasureFound.includes(treasure)) {
		save.treasureFound = save.treasureFound.filter(t => t !== treasure)
		return true
	} else {
		return false
	}
}