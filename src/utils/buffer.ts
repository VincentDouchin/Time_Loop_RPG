export const getBuffer = (width: number, height: number, offscreen = true) => {
	if (offscreen) {
		const canvas = new OffscreenCanvas(width, height)
		const ctx = canvas.getContext('2d', { alpha: true })!
		ctx.imageSmoothingEnabled = false
		return ctx
	} else {
		const canvas = document.createElement('canvas')
		const ctx = canvas.getContext('2d', { alpha: true })!
		ctx.canvas.height = height
		ctx.canvas.width = width
		ctx.imageSmoothingEnabled = false
		return ctx
	}
}
