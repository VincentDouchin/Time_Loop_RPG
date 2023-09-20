import type { keys } from '@/constants/dialog'
import { objectKeys } from '@/utils/mapFunctions'

interface PlayerData {
	name: characters
}
interface saveData {
	players: PlayerData[]
	lastNodeUUID?: string
	keys: Array<typeof keys[number]>
}

let saveObject: saveData = {
	players: [],
	keys: [],
}
function saveToLocalStorage() {
	localStorage.setItem('saveData', JSON.stringify(saveObject))
}
function createRecursiveProxy(target: any, path: string[] = []): any {
	return new Proxy(target, {
		get(subTarget, key) {
			if (typeof subTarget[key] === 'object' && subTarget[key] !== null) {
				// If the property is an object, create a Proxy for it recursively
				return createRecursiveProxy(subTarget[key], [...path, String(key)])
			}
			return subTarget[key]
		},
		set(subTarget, key, value) {
			subTarget[key] = value
			saveToLocalStorage()
			return true // Indicates success
		},
		deleteProperty(subTarget, key) {
			if (key in subTarget) {
				delete subTarget[key]
				saveToLocalStorage()
				return true // Indicates success
			}
			return false // Property not found
		},
	})
}

export const getSave = () => {
	const saveDataString = localStorage.getItem('saveData')
	if (saveDataString) {
		const localSaveObject = JSON.parse(saveDataString) as saveData
		for (const key of objectKeys(saveObject)) {
			if (!(key in localSaveObject)) {
				Object.assign(localSaveObject, { [key]: saveObject[key] })
			}
		}
		saveObject = localSaveObject
	}

	// Create a recursive Proxy for the save object to automatically save changes to localStorage
	const saveProxy = createRecursiveProxy(saveObject)

	return saveProxy as saveData
}
export const save = getSave()
