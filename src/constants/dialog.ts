import { lockPlayer, unlockPlayer } from './dialogHelpers'
import { despwawnCutscene } from '@/battle/cutscenes'
import { overworldState } from '@/main'
import { save, saveToLocalStorage } from '@/save/saveData'

export const keys = ['oldManBandit'] as const
const addKey = (key: typeof keys[number]) => {
	save.keys = [...save.keys, key]
	saveToLocalStorage()
}

const hasKey = (key: typeof keys[number]) => save.keys.includes(key)
export const dialog: Partial<Record<characters | `sign${string}`, () => Generator>> = {
	*howard() {
		lockPlayer()
		yield 'Hello adventurer!'
		yield 'My name is Howard'
		yield 'I am the innkeeper'
		yield 'Do you want a drink?'
		const answer = yield ['yes', 'no']
		switch (answer) {
		case 0:yield 'Here you go'
			break
		case 1:yield 'Alright!'
			break
		}

		yield unlockPlayer()
	},
	*banditOldMan() {
		while (true) {
			lockPlayer()
			yield 'Hello adventurer'
			if (hasKey('oldManBandit')) {
				yield 'Have you seen Tyler?'
			} else {
				yield 'Have you seem my son Tyler on the way here?'
				yield 'He hangs out in the woods near by'
				yield 'and tries to scare the travellers'
				yield 'Can you tell him to come home'
				yield 'if you see him?'
				yield 'His mother is worried and her health is getting worse'
				yield 'I would really appreciate it.'
				addKey('oldManBandit')
			}
			unlockPlayer()
			yield
		}
	},
	*banditLeader() {
		if (hasKey('oldManBandit')) {
			yield 'You talked to my old man?'
			yield '...'
			yield 'Mom is not doing well?'
			yield '...'
			yield 'Just go'
			overworldState.enable()
		} else {
			yield 'Give us all your stuff!'
		}
		yield despwawnCutscene()
	},
	*signTavern() {
		while (true) {
			yield 'Thirsty Chauldron Tavern'
		}
	},
} as const
