import { easing } from 'ts-easing'
import type { TEasing } from 'ts-easing'

export class Tween {
	static tweens = new Set<Tween>()
	#easingFunction: TEasing = easing.linear
	#updateFunctions: { from: number; to: number; fn: (t: number) => unknown }[] = []
	#time = 0
	#onComplete?: (...args: unknown[]) => unknown
	finished = false
	constructor(private duration: number) {
		Tween.tweens.add(this)
	}

	easing(func: TEasing) {
		this.#easingFunction = func
		return this
	}

	onUpdate(fn: (ratio: number) => unknown, from = 0, to = 1) {
		this.#updateFunctions.push({ from, to, fn })
		return this
	}

	tick(deltaInMs: number) {
		this.#time += deltaInMs
		if (this.#time >= this.duration) {
			this.finished = true
			Tween.tweens.delete(this)
			if (this.#onComplete) {
				this.#onComplete()
			}
		}
		const ratio = this.#easingFunction(this.#time / this.duration)
		for (const { from, to, fn } of this.#updateFunctions) {
			fn(from + (to - from) * ratio)
		}
	}

	static update(t: number) {
		for (const tween of Tween.tweens) {
			tween.tick(t)
		}
	}

	onComplete(fn: (...args: unknown[]) => unknown) {
		this.#onComplete = fn
	}
}
