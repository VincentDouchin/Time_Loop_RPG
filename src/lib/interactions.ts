import type { OrthographicCamera } from 'three'
import { Group, Raycaster, Vector2 } from 'three'
import { Component } from './ECS'
import { mainCameraQuery } from './camera'
import { UIElement } from '@/ui/UiElement'
import { ecs, renderer } from '@/globals/init'

export enum InteractableType {
	PlayerAttack,
	PlayerFlee,
	Battler,
	InventoryToggle,
}

@Component(ecs)
export class Interactable {
	hover = false
	#pressed = false
	#wasPressed = false
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

const interactablesQuery = ecs.query.pick(Interactable, Group)
const uiInteractablesQuery = ecs.query.pick(Interactable, UIElement)

export const detectInteractions = () => {
	const camera = mainCameraQuery.extract()
	if (camera) {
		const hovered: Interactable[] = []
		const pressed: Interactable[] = []
		for (const pointer of PointerInput.all) {
			let distance = null
			let closestInteractable: Interactable | null = null
			for (const [interactable, group] of interactablesQuery.getAll()) {
				const intersections = pointer.getRay(camera).intersectObject(group, true)
				for (const intersection of intersections) {
					if (distance === null || intersection.distance < distance) {
						closestInteractable = interactable
						distance = intersection.distance
					}
				}
			}
			if (closestInteractable) {
				hovered.push(closestInteractable)
				if (pointer.pressed) {
					pressed.push(closestInteractable)
				}
			}
		}
		for (const [interactable] of interactablesQuery.getAll()) {
			interactable.hover = hovered.includes(interactable)
			interactable.pressed = pressed.includes(interactable)
		}
	}
	for (const [interactable, uiElement] of uiInteractablesQuery.getAll()) {
		const bounds = uiElement.getBoundingClientRect()
		for (const pointer of PointerInput.all) {
			if (pointer.screenPosition.x > bounds.left && pointer.screenPosition.x < bounds.right && pointer.screenPosition.y > bounds.top && pointer.screenPosition.y < bounds.bottom) {
				interactable.hover = true
				interactable.pressed = pointer.pressed
			} else {
				interactable.hover = false
				interactable.pressed = false
			}
		}
	}
}
