import { UIElement } from './UiElement'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'

// const shader = new ShaderMaterial({ vertexShader, fragmentShader })

export type margins = number | { x: number; y: number } | { top: number; bottom: number; right: number; left: number }

const getMargins = (margins: margins) => {
	if (typeof margins === 'number') {
		return { left: margins, right: margins, top: margins, bottom: margins }
	} else if ('x' in margins) {
		return { top: margins.y, bottom: margins.y, left: margins.x, right: margins.x }
	} else {
		return margins
	}
}
// @Component(ecs)
// export class NineSlice {
// 	margins: {
// 	top: number
// 	bottom: number
// 	left: number
// 	right: number
// 	}

// 	constructor(public image: HTMLImageElement, margins: margins, public scale = 1) {
// 		this.margins = getMargins(margins)
// 	}
// }
// @Component(ecs)
// export class NineSliceShader extends ShaderPass {
// 	constructor(margins: margins, texture: Texture, scale: number = 1) {
// 		super(shader)
// 		// this.uniforms.frame = new Uniform(texture)
// 		const newMargins = getMargins(margins)
// 		// this.uniforms.size = new Uniform([texture.image.width, texture.image.height])
// 		// this.uniforms.new_size = new Uniform([texture.image.width, texture.image.height])
// 		this.uniforms.top = new Uniform(newMargins.top)
// 		this.uniforms.bottom = new Uniform(newMargins.bottom)
// 		this.uniforms.left = new Uniform(newMargins.left)
// 		this.uniforms.right = new Uniform(newMargins.right)
// 		this.uniforms.scale = new Uniform(scale)
// 	}

// 	setNewSize(size: Vec2) {
// 		this.uniforms.new_size.value = [size.x, size.y]
// 	}
// }
// const getNinePatch = (image: HTMLImageElement, margins: { top: number; bottom: number; left: number; right: number }, width: number, height: number) => {
// 	const marginTop = margins.top
// 	const marginBottom = margins.bottom
// 	const marginLeft = margins.left
// 	const marginRight = margins.right
// 	const totalWidth = width + marginLeft + marginRight
// 	const totalHeight = height + marginBottom + marginTop
// 	const thisCenterWidth = image.width - marginLeft - marginRight
// 	const thisCenterHeight = image.height - marginBottom - marginTop
// 	const buffer = getBuffer(totalWidth, totalHeight)
// 	// Top Left
// 	buffer.drawImage(
// 		image,
// 		0, 0, marginLeft, marginTop,
// 		0, 0, marginLeft, marginTop,
// 	)
// 	// Top Right
// 	buffer.drawImage(
// 		image,
// 		image.width - marginRight, 0, marginRight, marginTop,
// 		totalWidth - marginRight, 0, marginRight, marginTop,
// 	)
// 	// Bottom Left
// 	buffer.drawImage(
// 		image,
// 		0, image.height - marginBottom, marginLeft, marginBottom,
// 		0, totalHeight - marginBottom, marginLeft, marginBottom,
// 	)
// 	// Bottom Right
// 	buffer.drawImage(
// 		image,
// 		image.width - marginRight, image.height - marginBottom, marginRight, marginBottom,
// 		totalWidth - marginRight, totalHeight - marginBottom, marginRight, marginBottom,
// 	)
// 	// Center
// 	const thissX = Math.ceil(width / thisCenterWidth)
// 	const thissY = Math.ceil(height / thisCenterHeight)
// 	for (let x = 0; x < thissX; x++) {
// 		const w = x === thissX - 1 ? (width % thisCenterWidth || thisCenterWidth) : thisCenterWidth
// 		buffer.drawImage(
// 			image,
// 			marginLeft, 0, thisCenterWidth, marginTop,
// 			marginLeft + x * thisCenterWidth, 0, w, marginTop,
// 		)
// 		// Bottom
// 		buffer.drawImage(
// 			image,
// 			marginLeft, marginTop + thisCenterHeight, thisCenterWidth, marginTop,
// 			marginLeft + x * thisCenterWidth, height + marginTop, w, marginTop,
// 		)
// 		for (let y = 0; y < thissY; y++) {
// 			const h = y === thissY - 1 ? (height % thisCenterHeight || thisCenterHeight) : thisCenterHeight
// 			if (x === 0) {
// 				// Left
// 				buffer.drawImage(
// 					image,
// 					0, marginTop, marginLeft, thisCenterHeight,
// 					0, marginTop + y * thisCenterHeight, marginLeft, h,
// 				)
// 				// Right
// 				buffer.drawImage(
// 					image,
// 					thisCenterWidth + marginLeft, marginTop, marginRight, thisCenterHeight,
// 					width + marginLeft, marginTop + y * thisCenterHeight, marginRight, h,
// 				)
// 			}
// 			// Center
// 			buffer.drawImage(
// 				image,
// 				marginLeft, marginTop, w, h,
// 				marginLeft + x * thisCenterWidth, marginTop + y * thisCenterHeight, w, h,
// 			)
// 		}
// 	}

// 	return buffer
// }
// const nineSliceUiQuery = ecs.query.pick(Block, NineSlice).added(NineSlice)
// export const addNineSliceTextureToBlock = () => {
// 	for (const [block, nineSlice] of nineSliceUiQuery.getAll()) {
// 		// @ts-expect-error wrong types
// 		let size = { ...block.size }
// 		block.onAfterUpdate = () => {
// 			// @ts-expect-error wrong types
// 			if (block.size.x === size.x && block.size.y === size.y) return
// 			// @ts-expect-error wrong types
// 			size = { ...block.size }
// 			// @ts-expect-error wrong types
// 			const buffer = getNinePatch(nineSlice.image, nineSlice.margins, block.size.x, block.size.y)
// 			block.set({ backgroundTexture: new PixelTexture(buffer.canvas) })
// 		}
// 	}
// }
@Component(ecs)
export class NineSlice {
	margins: { left: number; right: number; top: number; bottom: number }
	constructor(public image: string, margins: margins, public scale = 1) {
		this.margins = getMargins(margins)
	}
}

const ninesliceUIQuery = ecs.query.pick(UIElement, NineSlice).added(NineSlice)

export const addNineSlicetoUI = () => {
	for (const [uiElement, nineSlice] of ninesliceUIQuery.getAll()) {
		uiElement.setStyle('border-image', `url(${nineSlice.image})`)
		uiElement.setStyle('border-image-slice', 'fill 16')
		uiElement.setStyle('border-image-repeat', 'round')
		uiElement.setStyle(
			'border-width',
			[nineSlice.margins.top, nineSlice.margins.bottom, nineSlice.margins.left, nineSlice.margins.right]
				.map(border => `${border * nineSlice.scale}px`)
				.join(' '),
		)
		uiElement.setStyle('border-style', 'solid')
	}
}
