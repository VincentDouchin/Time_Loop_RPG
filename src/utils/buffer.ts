export const getOffscreenBuffer = (width: number, height: number) => {
	const canvas = new OffscreenCanvas(width, height)
	const ctx = canvas.getContext('2d', { alpha: true })!
	ctx.imageSmoothingEnabled = false
	return ctx
}

export const getScreenBuffer = (width: number, height: number) => {
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d', { alpha: true })!
	return ctx
}

export const toCanvas = (offscreen: OffscreenCanvas) => {
	const canvas = document.createElement('canvas')
	canvas.width = offscreen.width
	canvas.height = offscreen.height
	const ctx = canvas.getContext('2d', { alpha: true })!
	ctx.drawImage(offscreen, 0, 0)
	return canvas
}
