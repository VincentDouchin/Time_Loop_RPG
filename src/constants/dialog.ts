import { lockPlayer, unlockPlayer } from './dialogHelpers'

export const dialog: Partial<Record<characters | `sign${string}`, () => Generator>> = {
	*howard() {
		yield 'Hello adventurer!'
		lockPlayer()
		yield 'My name is Howard'
		yield 'I am the innkeeper'
		yield 'Do you want a drink?'
		const answer = yield ['yes', 'no']
		if (answer === 0) {
			yield 'Here you go'
		} else if (answer === 1) {
			yield 'Alright!'
		}
		yield unlockPlayer()
	},
	*signTavern() {
		while (true) {
			yield 'Thirsty Chauldron Tavern'
		}
	},
} as const
