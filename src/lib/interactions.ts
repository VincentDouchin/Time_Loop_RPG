import type { OrthographicCamera } from 'three'
import { Group, Raycaster, Vector2 } from 'three'
import { Component } from './ECS'
import { mainCameraQuery } from './camera'
import { UIElement } from '@/ui/UiElement'
import { ecs, renderer } from '@/globals/init'

export enum InteractableType {
	StartMultiplayer,
	PlayerAttack,
	PlayerFlee,
	Battler,
}

@Component(ecs)
export class Interactable {
	hover = false
	#pressed = false
	#wasPressed = false
	lastTouchedBy: PointerInput | null = null
	constructor(public type?: InteractableType) {}
	get pressed() {
		return this.#pressed
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
	pressed = false
	target: EventTarget | null = null
	constructor(private down: string, private up: string) {
	}

	setFromScreenCoords(element: HTMLElement, event: string, e: Touch | MouseEvent) {
		const bounds = element.getBoundingClientRect()
		const x = ((e.clientX - bounds.left) / element.clientWidth) * 2 - 1
		const y = 1 - ((e.clientY - bounds.top) / element.clientHeight) * 2
		this.position = new Vector2(x, y)
		if (event === this.down) {
			this.pressed = true
			this.target = e.target
		}
		if (event === this.up) {
			this.pressed = false
			this.target = null
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
		window.addEventListener(event, (e) => {
			e.preventDefault()
			const touchInput = PointerInput.pointers.get('mouse')
			if (!touchInput) {
				PointerInput.pointers.set('mouse', new PointerInput('mousedown', 'mouseup'))
			} else {
				touchInput.setFromScreenCoords(renderer.domElement, event, e)
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

const interactablesQuery = ecs.query.pick(Interactable, Group)
const uiInteractablesQuery = ecs.query.pick(Interactable, UIElement)

export const detectInteractions = () => {
	const camera = mainCameraQuery.extract()
	if (camera) {
		for (const [interactable, group] of interactablesQuery.getAll()) {
			const touchingPointer = PointerInput.all.find(pointer => pointer.getRay(camera).intersectObject(group, true).length)
			if (touchingPointer) {
				interactable.hover = true
				interactable.pressed = touchingPointer.pressed
				interactable.lastTouchedBy = touchingPointer
				break
			} else {
				interactable.pressed = false
				interactable.hover = false
			}
		}
	}
	for (const [interactable, uiElement] of uiInteractablesQuery.getAll()) {
		const touchingPointer = PointerInput.all.find(pointer => pointer.target === uiElement)
		if (touchingPointer) {
			interactable.hover = true
			interactable.pressed = touchingPointer.pressed
		} else {
			interactable.hover = false
			interactable.pressed = false
		}
	}
}
