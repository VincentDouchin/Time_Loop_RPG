import { EventBus } from './eventBus'

export function Component(ecs: ECS) {
	return (constructor: Class) => {
		ecs.registerComponent(constructor)
	}
}
export interface Class { new(...args: any[]): any }
export type Constructor<T> = new (...args: any[]) => T

type QueryPicked<T extends Class[]> = {
	[K in keyof T]: T[K] extends infer R extends Class ? InstanceType<R> : never;
}

export type System<R extends any[] = []> = ((...ressources: R) => void) | (() => void)

export const systemSet = (systems: System[]) => () => {
	for (const system of systems) {
		system()
	}
}
export const runif = (condition: () => boolean, ...systems: Array<() => unknown>) => () => {
	if (condition()) {
		for (const system of systems) {
			system()
		}
	}
}
export const throttle = (delay: number, ...systems: Array<() => unknown>) => {
	let time = Date.now()
	return () => {
		if (Date.now() - time >= delay) {
			for (const system of systems) {
				system()
			}
			time = Date.now()
		}
	}
}

class Query<T extends InstanceType<Class>[] = []> extends Map<Entity, T> {
	#components: Class[] = []
	#conditions: Array<(entity: Entity) => boolean> = []
	constructor(private ecs: ECS) {
		super()
	}

	addEntity(entity: Entity) {
		this.set(entity, this.#components.map(c => this.ecs.getComponentsMap(c).get(entity)) as T)
	}

	addCondition(condition: (entity: Entity) => boolean) {
		for (const entity of this.keys()) {
			if (!condition(entity)) {
				this.delete(entity)
			}
		}
		this.#conditions.push(condition)
	}

	checkEntity(entity: Entity) {
		for (const component of this.#components) {
			if (!this.ecs.getComponentsMap(component).has(entity)) {
				return false
			}
		}
		for (const condition of this.#conditions) {
			if (!condition(entity)) {
				return false
			}
		}
		return true
	}

	pick<C extends Class[]>(...components: C) {
		this.#components.push(...components)
		for (const component of components) {
			const entities = this.size === 0 ? this.ecs.entities : this.keys()
			this.with(component)
			for (const entity of entities) {
				if (this.checkEntity(entity)) {
					this.addEntity(entity)
				}
			}
		}
		return this as Query<QueryPicked<C>>
	}

	with(...components: Class[]) {
		for (const component of components) {
			this.addCondition(entity => this.ecs.getComponentsMap(component).has(entity))
			this.ecs.eventBus.subscribe(component.name, (entity, type) => {
				if (this.checkEntity(entity) && type === 'added') {
					this.addEntity(entity)
				} else if (type === 'deleted') {
					this.delete(entity)
				}
			})
		}
		return this
	}

	without(...components: Class[]) {
		for (const component of components) {
			this.addCondition((entity: Entity) => !this.ecs.getComponentsMap(component).has(entity))
			this.ecs.eventBus.subscribe(component.name, (entity, type) => {
				if (this.checkEntity(entity) && type === 'deleted') {
					this.addEntity(entity)
				} else if (type === 'added') {
					this.delete(entity)
				}
			})
		}
		return this
	}

	removed<C extends Class>(component: C) {
		if (!this.#components.includes(component)) {
			this.addCondition((entity: Entity) => this.ecs.getComponentsMap(component).has(entity))
		}
		this.ecs.eventBus.subscribe(component.name, (entity, type) => {
			if (this.checkEntity(entity) && type === 'removed') {
				this.addEntity(entity)
				this.ecs.onNextTick(() => this.delete(entity))
			} else if (type === 'added') {
				this.delete(entity)
			}
		})

		return this
	}

	added<C extends Class>(component: C) {
		this.addCondition((entity: Entity) => this.ecs.getComponentsMap(component).has(entity))
		this.ecs.eventBus.subscribe(component.name, (entity, type) => {
			if (this.checkEntity(entity) && type === 'added') {
				this.addEntity(entity)
				this.ecs.onNextTick(() => this.delete(entity))
			} else {
				this.delete(entity)
			}
		})
		return this
	}

	getAll() {
		return this.values()
	}

	getSingle() {
		for (const item of this.values()) {
			if (item) {
				return item
			}
		}
		return undefined
	}

	toArray() {
		return Array.from(this.values())
	}

	extract() {
		const res = this.getSingle()
		if (res) {
			return res[0] as T[0]
		}
	}
}

export class Entity {
	name?: string
	children = new Set<Entity>()
	parent?: Entity
	constructor(private ecs: ECS) { }
	_label?: string
	label(label: string) {
		this._label = label
		return this
	}

	get components() {
		return this.ecs.getComponents(this)
	}

	addChildren(entity: Entity) {
		entity.parent = this
		this.children.add(entity)
	}

	spawn(...components: InstanceType<Class>[] | [(entity: Entity) => Entity]): Entity {
		if (components[0] instanceof Function) {
			return components[0](this)
		} else {
			const entity = this.ecs.spawn(...components)
			this.addChildren(entity)
			return entity
		}
	}

	despawn() {
		this.ecs.despawn(this)
	}

	despawnChildren() {
		for (const children of this.children) {
			children.despawn()
		}
	}

	getComponent<C extends Class>(component: C) {
		return this.ecs.getComponentsMap(component).get(this)
	}

	addComponent(...components: InstanceType<Class>[]) {
		this.ecs.onNextTick(() => {
			for (const component of components) {
				if (!this.getComponent(component.constructor)) {
					this.ecs.getComponentsMap(component.constructor).set(this, component)
					this.ecs.eventBus.publish(component.constructor.name, this, 'added')
				}
			}
		})
		return this
	}

	removeComponent<C extends Class>(component: C) {
		this.ecs.onNextTick(() => {
			if (this.ecs.getComponentsMap(component)?.has(this)) {
				this.ecs.eventBus.publish(component.name, this, 'removed')
				this.ecs.getComponentsMap(component).delete(this)
				this.ecs.onNextTick(() => this.ecs.eventBus.publish(component.name, this, 'deleted'))
			}
		})
		return this
	}

	withChildren(fn: (entity: Entity) => void) {
		fn(this)
		return this
	}
}

export class State<R extends any[] = []> {
	#update: System<R>[] = []
	#preUpdate: System<R>[] = []
	#postUpdate: System<R>[] = []
	#enter: System<R>[] = []
	#exit: System<R>[] = []
	ressources?: R
	constructor(private ecs: ECS) { }
	static exclusive(...states: State<any>[]) {
		for (const state of states) {
			state.onEnter(...states.filter(s => s !== state).map(s => () => s.disable()))
		}
	}

	get isActive() {
		return this.ecs.states.has(this)
	}

	onPreUpdate(...systems: System<R>[]) {
		this.#preUpdate.push(...systems)
		return this
	}

	onUpdate(...systems: System<R>[]) {
		this.#update.push(...systems)
		return this
	}

	onPostUpdate(...systems: System<R>[]) {
		this.#postUpdate.push(...systems)
		return this
	}

	onEnter(...systems: System<R>[]) {
		this.#enter.push(...systems)
		return this
	}

	onExit(...systems: System<R>[]) {
		this.#exit.push(...systems)
		return this
	}

	update() {
		const r = (this.ressources ?? []) as R
		this.#update.forEach(update => update(...r))
	}

	preUpdate() {
		const r = (this.ressources ?? []) as R
		this.#preUpdate.forEach(update => update(...r))
	}

	postUpdate() {
		const r = (this.ressources ?? []) as R
		this.#postUpdate.forEach(update => update(...r))
	}

	enter(...ressources: R) {
		this.ressources = ressources
		this.#enter.forEach(enter => enter(...ressources))
	}

	exit(ressources: R) {
		this.#exit.forEach(exit => exit(...ressources))
		this.ressources = undefined
	}

	enable(...ressources: R) {
		if (!this.ecs.states.has(this)) {
			this.enter(...ressources)
			this.ecs.states.add(this)
		}
		return this
	}

	disable() {
		const r = (this.ressources ?? []) as R
		this.exit(r)
		this.ecs.states.delete(this)
		return this
	}

	toggle(...ressources: R) {
		this.isActive ? this.disable() : this.enable(...ressources)
		return this
	}
}

export class ECS {
	states = new Set<State<any>>()
	entities = new Set<Entity>()
	#callBacks = new Set<() => void>()
	#callBacks2 = new Set<() => void>()
	#components = new Map<Class, Map<Entity, InstanceType<Class>>>()
	#queries = new Set<Query>()
	core = new State(this)
	eventBus = new EventBus<Record<Class['name'], [Entity, 'added' | 'removed' | 'deleted']>>()
	constructor() {
		this.registerComponent(Entity)
	}

	addPlugin(...plugins: Array<(ecs: ECS) => void>) {
		for (const plugin of plugins) {
			plugin(this)
		}
		return this
	}

	getComponents(entity: Entity) {
		return [...this.#components.values()].map(componentMap => componentMap.get(entity)).filter(Boolean)
	}

	onNextTick(func: () => void) {
		this.#callBacks2.add(func)
	}

	registerComponent<T extends Class>(component: T) {
		if (!this.#components.has(component)) {
			this.#components.set(component, new Map<Entity, InstanceType<T>>())
			this.eventBus.registerEvent(component.name)
		}
	}

	getComponentsMap<T extends Class>(component: T) {
		if (!this.#components.get(component)) {
			console.error(`can't find component ${component.name}`)
		}
		return this.#components.get(component) as Map<Entity, InstanceType<T>>
	}

	get query() {
		const query = new Query(this)
		this.#queries.add(query)
		return query
	}

	spawn(...components: InstanceType<Class>[] | [(ecs: ECS) => Entity]): Entity {
		if (components[0] instanceof Function) {
			return components[0](this)
		} else {
			const entity = new Entity(this)
			entity.addComponent(entity)
			this.entities.add(entity)
			for (const component of components) {
				entity.addComponent(component)
			}
			return entity
		}
	}

	despawn(entity: Entity) {
		for (const component of this.#components.keys()) {
			entity.removeComponent(component)
		}
		for (const children of entity.children) {
			this.despawn(children)
		}
	}

	state<R extends any[] = []>() {
		return new State<R>(this)
	}

	update() {
		for (const state of this.states) {
			state.preUpdate()
		}
		for (const state of this.states) {
			state.update()
		}
		for (const state of this.states) {
			state.postUpdate()
		}

		[this.#callBacks, this.#callBacks2] = [this.#callBacks2, this.#callBacks]
		for (const callback of this.#callBacks) {
			callback()
		}
		this.#callBacks.clear()
	}
}
