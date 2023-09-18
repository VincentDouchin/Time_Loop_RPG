import { EventBus } from './eventBus'

export function Component(ecs: ECS) {
	return (constructor: Class) => {
		ecs.registerComponent(constructor)
	}
}

interface systemSet extends System {
	conditions: (() => boolean)[]
	timeout: number
	runIf: (condition: () => boolean) => systemSet
	throttle: (timeout: number) => systemSet
}

export function SystemSet(...systems: System[]): systemSet {
	let time = Date.now()
	const set: systemSet = function (ecs: ECS) {
		if (set.timeout > 0 && (time + set.timeout - Date.now()) < 0) {
			if (set.conditions.every(condition => condition())) {
				systems.forEach(system => system(ecs))
				time = Date.now()
			}
		}
	}
	set.timeout = 0
	set.conditions = []
	set.runIf = (condition: () => boolean) => {
		set.conditions.push(condition)
		return set
	}
	set.throttle = (timeout: number) => {
		set.timeout = timeout
		return set
	}

	return set
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

export interface Class { new(...args: any[]): any }
export type Constructor<T> = new (...args: any[]) => T

type QueryPicked<T extends Class[]> = {
	[K in keyof T]: T[K] extends infer R extends Class ? InstanceType<R> : never;
}

export type System = (ecs: ECS) => void

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

	spawn(...components: InstanceType<Class>[]) {
		const entity = this.ecs.spawn(...components)
		entity.parent = this
		this.children.add(entity)
		return entity
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
	}

	removeComponent<C extends Class>(component: C) {
		this.ecs.onNextTick(() => {
			if (this.ecs.getComponentsMap(component)?.has(this)) {
				this.ecs.eventBus.publish(component.name, this, 'removed')
				this.ecs.getComponentsMap(component).delete(this)
				this.ecs.onNextTick(() => this.ecs.eventBus.publish(component.name, this, 'deleted'))
			}
		})
	}

	withChildren(fn: (entity: Entity) => void) {
		fn(this)
		return this
	}
}

export class State {
	#update: System[] = []
	#preUpdate: System[] = []
	#postUpdate: System[] = []
	#enter: System[] = []
	#exit: System[] = []
	constructor(private ecs: ECS) { }
	static exclusive(...states: State[]) {
		for (const state of states) {
			state.onEnter(...states.filter(s => s !== state).map(s => () => s.disable()))
		}
	}

	get isActive() {
		return this.ecs.isStateActive(this)
	}

	onPreUpdate(...systems: System[]) {
		this.#preUpdate.push(...systems)
		return this
	}

	onUpdate(...systems: System[]) {
		this.#update.push(...systems)
		return this
	}

	onPostUpdate(...systems: System[]) {
		this.#postUpdate.push(...systems)
		return this
	}

	onEnter(...systems: System[]) {
		this.#enter.push(...systems)
		return this
	}

	onExit(...systems: System[]) {
		this.#exit.push(...systems)
		return this
	}

	update() {
		this.#update.forEach(update => update(this.ecs))
	}

	preUpdate() {
		this.#preUpdate.forEach(update => update(this.ecs))
	}

	postUpdate() {
		this.#postUpdate.forEach(update => update(this.ecs))
	}

	enter() {
		this.#enter.forEach(enter => enter(this.ecs))
	}

	exit() {
		this.#exit.forEach(exit => exit(this.ecs))
	}

	enable() {
		if (!this.ecs.states.has(this)) {
			this.ecs.setState(this)
		}
		return this
	}

	disable() {
		this.ecs.unsetState(this)
		return this
	}

	toggle() {
		this.isActive ? this.disable() : this.enable()
		return this
	}
}

export class ECS {
	states = new Set<State>()
	entities = new Set<Entity>()
	#callBacks = new Set<() => void>()
	#callBacks2 = new Set<() => void>()
	#components = new Map<Class, Map<Entity, InstanceType<Class>>>()
	#queries = new Set<Query>()
	core = new State(this)
	eventBus = new EventBus<Record<Class['name'], [Entity, 'added' | 'removed' | 'deleted'] >>()
	constructor() {
		this.registerComponent(Entity)
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

	spawn<C extends InstanceType<Class>[]>(...components: C) {
		const entity = new Entity(this)
		entity.addComponent(entity)
		this.entities.add(entity)
		for (const component of components) {
			entity.addComponent(component)
		}

		return entity
	}

	despawn(entity: Entity) {
		for (const component of this.#components.keys()) {
			entity.removeComponent(component)
		}
		for (const children of entity.children) {
			this.despawn(children)
		}
	}

	isStateActive(state: State) {
		return this.states.has(state)
	}

	get state() {
		return new State(this)
	}

	setState(state: State) {
		state.enter()
		this.states.add(state)
	}

	unsetState(state: State) {
		state.exit()
		this.states.delete(state)
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
