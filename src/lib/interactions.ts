import type { OrthographicCamera } from 'three'
import { Group, Raycaster, Vector2, WebGLRenderer } from 'three'
import { Block } from 'three-mesh-ui'
import { Component } from './ECS'
import { UICameraQuery, mainCameraQuery } from './camera'
import { ecs } from '@/globals/init'

export enum InteractableType {
	StartMultiplayer,
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
	constructor(private down: string, private up: string) {
	}

	setFromScreenCoords(element: HTMLElement, event: string, e: Touch | MouseEvent) {
		const bounds = element.getBoundingClientRect()
		const x = ((e.clientX - bounds.left) / element.clientWidth) * 2 - 1
		const y = 1 - ((e.clientY - bounds.top) / element.clientHeight) * 2
		this.position = new Vector2(x, y)
		if (event === this.down) {
			this.pressed = true
		}
		if (event === this.up) {
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

const rendererQuery = ecs.query.pick(WebGLRenderer)

export const updateMousePosition = () => {
	const rendererEntity = rendererQuery.getSingle()
	if (rendererEntity) {
		const [renderer] = rendererEntity
		for (const event of ['mouseup', 'mousemove', 'mousedown'] as const) {
			renderer.domElement.addEventListener(event, (e) => {
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
			renderer.domElement.addEventListener(event, (e) => {
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
}

const interactablesQuery = ecs.query.pick(Interactable, Group)
const uiInteractablesQuery = ecs.query.pick(Interactable, Block)

export const detectInteractions = () => {
	for (const [query, cameraQuery] of [[interactablesQuery, mainCameraQuery], [uiInteractablesQuery, UICameraQuery]] as const) {
		const camera = cameraQuery.extract()
		if (camera) {
			for (const [interactable, group] of query.getAll()) {
				const touchingPointer = PointerInput.all.find(pointer => pointer.getRay(camera).intersectObject(group, true).length)
				if (touchingPointer) {
					interactable.hover = true
					interactable.pressed = touchingPointer.pressed
					interactable.lastTouchedBy = touchingPointer
				} else {
					interactable.pressed = false
					interactable.hover = false
				}
			}
		}
	}
}
