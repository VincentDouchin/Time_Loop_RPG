import type { characterNames } from './animations'

export const dialog: Partial<Record<characterNames, () => Generator>> = {
	*howard() {
		yield 'hello'
		yield 'My name is Howard'
		yield 'I am the innkeeper'
		while (true) {
			yield 'Do you want a drink?'
		}
	},
} as const
