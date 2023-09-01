interface PlayerData {
	name: characters
}
interface saveData {
	players: PlayerData[]
}

let save: saveData = {
	players: [],
}

export const getSave = () => {
	const saveDataString = localStorage.getItem('saveData')
	if (saveDataString) {
		save = JSON.parse(saveDataString)
	}
	return new Proxy(save, {
		set() {
			localStorage.setItem('saveData', JSON.stringify(save))
			return true
		},
	})
}
