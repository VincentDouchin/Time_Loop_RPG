import { chopLog, despwawnCutscene, lockPlayer, pay, unlockPlayer } from '../utils/dialogHelpers'
import { updateSteps } from '@/states/overworld/overworldUi'
import { removeTreasure, save, saveToLocalStorage } from '@/save/saveData'
import { overworldState } from '@/globals/init'

export const keys = ['oldManBandit', 'oldManBanditdrink', 'lumberjack', 'splitLog', 'gnomeForest'] as const
export type key = typeof keys[number]
export const addKey = (key: typeof keys[number]) => {
	save.keys = [...save.keys, key]
	saveToLocalStorage()
}
export const removeKeys = (...keysToRemove: Array<typeof keys[number]>) => {
	save.keys = save.keys.filter(key => !keysToRemove.includes(key))
	saveToLocalStorage()
}

export const hasKey = (key: typeof keys[number]) => save.keys.includes(key)
export const dialog: Partial<Record<characters | `sign${string}`, () => Generator>> = {
	*howard() {
		while (true) {
			lockPlayer()
			yield 'Hello adventurer!'
			yield 'My name is Howard'
			yield 'I am the innkeeper'
			yield 'Do you want a drink?'
			const answer = yield ['yes', 'no']
			if (answer === 0) {
				yield 'It will be 10 gils please'
				const answer = yield ['Pay', 'Leave']
				if (answer === 0) {
					if (pay(10)) {
						save.treasureFound.push('Beer')
						yield 'Here you go!'
						yield '...'
						yield 'Did you just put a full pint of beer in your backpack?'
					} else {
						yield 'It seems like you don\'t have enough money, sorry!'
					}
				} else {
					yield 'Goodbye!'
				}
			}
			yield unlockPlayer()
		}
	},
	*banditOldMan() {
		while (true) {
			lockPlayer()
			if (!hasKey('oldManBanditdrink')) {
				yield 'Hello adventurer'
				yield 'Won\'t you buy an old man a drink?'
				if (save.treasureFound.includes('Beer')) {
					removeTreasure('Beer')
					saveToLocalStorage()
					addKey('oldManBanditdrink')
				}
			} else {
				if (hasKey('oldManBandit')) {
					yield 'Have you seen Tyler?'
				} else {
					yield 'Thanks a lot stranger'
					yield 'Have you seem my son Tyler on the way here?'
					yield 'He hangs out in the woods near by and tries to scare the travellers'
					yield 'Can you tell him to come home if you see him?'
					yield 'His mother is worried and her health is getting worse'
					yield 'I would really appreciate it.'
					addKey('oldManBandit')
				}
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
			yield 'I need to go'
			updateSteps(1)
			overworldState.enable()
		} else {
			yield 'Give us all your stuff!'
		}
		yield despwawnCutscene()
	},
	*lumberjack() {
		if (!hasKey('lumberjack')) {
			yield 'Did you see this tree?'
			yield 'I was taking a nap and all of a sudden it fell in the middle of the road'
			yield 'And I can\'t do anything about it until I find my axe.'
			yield 'I think I lost it deeper in the woods, after the tavern'
			addKey('lumberjack')
			yield
		}
		if (save.treasureFound.includes('LumberjackAxe') && !hasKey('splitLog')) {
			lockPlayer()
			yield 'Oh great you found my axe!'
			yield 'I\'ll take care of this log right away'
			chopLog()
			yield
		}
		while (true) {
			yield 'I really wonder how such a huge trunk ended up here.'
			yield 'Especially in the perfect middle of the road.'
			yield
		}
	},
	*signTavern() {
		while (true) {
			yield 'Thirsty Chauldron Tavern'
		}
	},
	*gnomeForest() {
		yield 'Oi!'
		yield 'Wot ya doin\' \'ere?'
		yield 'Bugger off, why don\'t ya?'
		yield
		yield 'Awright, I\'ll tell ya where the portal is if ya leave me alone.'
		yield 'After the tavern, go right into the bleedin\' woods.'
		yield 'You\'ll find it there, mate.'
		yield 'It won\'t be much use to ya unless ya find some other portals, though.'
		yield 'And I\'m afraid with the end of the world scheduled for tonight, you won\'t \'ave much time.'
		addKey('gnomeForest')
	},
} as const
