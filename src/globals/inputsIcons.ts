import { getScreenBuffer } from '@/utils/buffer'

const keyboardMap = [
	['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12', '~', '!', '@', '#'],
	['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '+', '=', '_', '|'],
	['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '{', '}', '\\'],
	['Shift', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', '\'', '"', ':', ';', '*'],
	[' ', null, 'z', 'x', 'c', 'v', 'b', 'n', 'm', '<', '>', '?', '/', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'],
]

export const inputs = async (img: HTMLImageElement) => {
	const layout = await (<any>navigator).keyboard.getLayoutMap() as Map<string, string>
	return (type: 'keyboard', input: string) => {
		switch (type) {
			case 'keyboard':{
				const key = layout.get(input)
				if (key) {
					const x = keyboardMap.findIndex(r => r.includes(key))
					const y = keyboardMap[x].indexOf(key)
					const buffer = getScreenBuffer(16, 16)
					buffer.drawImage(img, 272 + x * 16, y * 16, 16, 16, 0, 0, 16, 16)
					return buffer.canvas
				}
			};break
		}
	}
}
