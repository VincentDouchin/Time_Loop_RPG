import { save, saveToLocalStorage } from '@/save/saveData'

export const giveMoney = (amount: number) => () => {
	save.money += amount
	saveToLocalStorage()
}