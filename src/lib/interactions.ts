import type { OrthographicCamera } from 'three'
import { Raycaster, Vector2, Vector3 } from 'three'
import { Component } from './ECS'
import { mainCameraQuery } from './camera'
import { Sprite } from './sprite'
import { UIElement } from '@/ui/UiElement'
import { ecs, renderer } from '@/globals/init'

@Component(ecs)
export class Interactable {
	hover: null | boolean = null
	#pressed: null | boolean = null
	#wasPressed: null | boolean = null
	position = new Vector2()
	dimensions = new Vector2()
	#onClick: (() => unknown) | null = null
	constructor(public x?: number, public y?: number) {	}
	onClick(fn: () => unknown) {
		this.#onClick = fn
		return this
	}

	triggerClick() {
		if (this.#onClick) {
			this.#onClick()
		}
	}

	get pressed() {
		return this.#pressed === true
	}

	set pressed(state: boolean) {
		this.#wasPressed = this.pressed
		this.#pressed = state
	}

	get justPressed() {
		return this.#wasPressed === false && this.#pressed === true
	}

	get justReleased() {
		return this.#wasPressed === true && this.#pressed === false
	}
}

class PointerInput {
	static pointers = new Map<string | number, PointerInput>()
	static get all() {
		return Array.from(PointerInput.pointers.values())
	}

	position = new Vector2()
	screenPosition = new Vector2()
	pressed = false
	constructor(private down: string, private up: string) {
	}

	setFromScreenCoords(element: HTMLElement, event: string, e: Touch | MouseEvent) {
		const bounds = element.getBoundingClientRect()
		this.screenPosition.x = e.clientX
		this.screenPosition.y = e.clientY
		const x = ((e.clientX - bounds.left) / element.clientWidth) * 2 - 1
		const y = 1 - ((e.clientY - bounds.top) / element.clientHeight) * 2
		this.position = new Vector2(x, y)
		if (event === this.down) {
			this.pressed = true
		} else if (event === this.up) {
			this.pressed = false
		}
	}

	getRay(camera: OrthographicCamera) {
		const raycaster = new Raycaster()
		raycaster.setFromCamera(this.position, camera)
		return raycaster
	}

	getPositionFromCamera(camera: OrthographicCamera) {
		const raycaster = new Raycaster()
		raycaster.setFromCamera(this.position, camera)
		const origin = new Vector2(raycaster.ray.origin.x, raycaster.ray.origin.y)
		return origin
	}
}

export const updateMousePosition = () => {
	for (const event of ['mouseup', 'mousemove', 'mousedown'] as const) {
		document.addEventListener(event, (e) => {
			e.preventDefault()
			const mouseInput = PointerInput.pointers.get('mouse')
			if (!mouseInput) {
				PointerInput.pointers.set('mouse', new PointerInput('mousedown', 'mouseup'))
			} else {
				mouseInput.setFromScreenCoords(renderer.domElement, event, e)
			}
		})
	}
	for (const event of ['touchstart', 'touchmove', 'touchend'] as const) {
		window.addEventListener(event, (e) => {
			e.preventDefault()
			for (const changedTouch of e.changedTouches) {
				const touchInput = PointerInput.pointers.get(changedTouch.identifier)
				if (!touchInput) {
					PointerInput.pointers.set(changedTouch.identifier, new PointerInput('touchstart', 'touchend'))
				} else {
					touchInput.setFromScreenCoords(renderer.domElement, event, changedTouch)
				}
			}
		})
	}
}

const worldInteractablesQuery = ecs.query.pick(Interactable, Sprite)
const uiInteractablesQuery = ecs.query.pick(Interactable, UIElement)
const interactableQuery = ecs.query.pick(Interactable)
export const detectInteractions = () => {
	const camera = mainCameraQuery.extract()
	if (camera) {
		// ! Update interactable position in world space
		for (const [interactable, sprite] of worldInteractablesQuery.getAll()) {
			let pos = new Vector3()
			pos = pos.setFromMatrixPosition(sprite.matrixWorld)
			pos.project(camera)
			const widthHalf = window.innerWidth / 2
			const heightHalf = window.innerHeight / 2

			interactable.position.x = (pos.x * widthHalf) + widthHalf
			interactable.position.y = -(pos.y * heightHalf) + heightHalf

			interactable.dimensions.x = (interactable.x ?? sprite.scaledDimensions.x) * camera.zoom
			interactable.dimensions.y = (interactable.x ?? interactable.y ?? sprite.scaledDimensions.y) * camera.zoom
		}
	}
	// ! Update interactable position in screen space
	for (const [interactable, uiElement] of uiInteractablesQuery.getAll()) {
		const bounds = uiElement.getBoundingClientRect()
		interactable.position.x = bounds.x + bounds.width / 2
		interactable.position.y = bounds.y + bounds.height / 2
		interactable.dimensions.x = bounds.width
		interactable.dimensions.y = bounds.height
	}
	const hovered: Interactable[] = []
	const pressed: Interactable[] = []
	for (const [interactable] of interactableQuery.getAll()) {
		for (const pointer of PointerInput.all) {
			const left = interactable.position.x - interactable.dimensions.x / 2
			const right = interactable.position.x + interactable.dimensions.x / 2
			const top = interactable.position.y + interactable.dimensions.y / 2
			const bottom = interactable.position.y - interactable.dimensions.y / 2
			if (pointer.screenPosition.x > left && pointer.screenPosition.x < right && pointer.screenPosition.y < top && pointer.screenPosition.y > bottom) {
				hovered.push(interactable)
				if (pointer.pressed) {
					pressed.push(interactable)
				}
			}
		}
		interactable.hover = hovered.includes(interactable)
		interactable.pressed = pressed.includes(interactable)
	}
}

export const triggerOnClick = () => {
	for (const [interactable] of interactableQuery.getAll()) {
		if (interactable.justPressed) {
			interactable.triggerClick()
		}
	}
}
