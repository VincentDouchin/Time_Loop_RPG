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
	#temp = new Set<Entity>()
	#conditions: Array<(entity: Entity) => boolean> = []
	constructor(private ecs: ECS) {
		super()
	}

	clearTemp() {
		for (const temp of this.#temp) {
			this.delete(temp)
		}
		this.#temp.clear()
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

	with<C extends Class>(component: C) {
		this.addCondition(entity => this.ecs.getComponentsMap(component).has(entity))
		this.ecs.eventBus.subscribe(component.name, ({ type, entity }) => {
			if (this.checkEntity(entity)) {
				if (type === 'added') {
					this.addEntity(entity)
				} else if (type === 'removed') {
					this.delete(entity)
				}
			}
		})
		return this
	}

	removed<C extends Class>(component: C) {
		this.addCondition((entity: Entity) => this.ecs.toDespawn.has(entity))
		this.ecs.eventBus.subscribe(component.name, ({ type, entity }) => {
			if (type === 'removed' && this.checkEntity(entity)) {
				this.addEntity(entity)
				this.#temp.add(entity)
			}
		})

		return this
	}

	added<C extends Class>(component: C) {
		this.addCondition(entity => this.ecs.getComponentsMap(component).has(entity))
		this.ecs.eventBus.subscribe(component.name, ({ type, entity }) => {
			if (type === 'added' && this.checkEntity(entity)) {
				this.addEntity(entity)
				this.#temp.add(entity)
			}
		})
		return this
	}

	without(component: Class) {
		this.addCondition((entity: Entity) => !this.ecs.getComponentsMap(component).has(entity))
		this.ecs.eventBus.subscribe(component.name, ({ type, entity }) => {
			if (type === 'added' && this.has(entity)) {
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
	spawn(...components: InstanceType<Class>[]) {
		const entity = this.ecs.spawn(...components)
		entity.parent = this
		this.children.add(entity)
		return entity
	}

	despawn() {
		this.ecs.despawn(this)
	}

	addComponent(component: InstanceType<Class>) {
		this.ecs.getComponentsMap(component.constructor).set(this, component)
		this.ecs.eventBus.publish(component.constructor.name, { type: 'added', entity: this })
	}

	getComponent<C extends Class>(component: C) {
		return this.ecs.getComponentsMap(component).get(this)
	}

	removeComponent<C extends Class>(component: C) {
		if (this.ecs.getComponentsMap(component)?.has(this)) {
			this.ecs.eventBus.publish(component.name, { type: 'removed', entity: this })
		}
	}
}

export class State {
	#preUpdate: System[] = []
	#update: System[] = []
	#postUpdate: System[] = []
	#enter: System[] = []
	#exit: System[] = []
	constructor(private ecs: ECS) { }
	get isActive() {
		return this.ecs.isStateActive(this)
	}

	onUpdate(...systems: System[]) {
		this.#update.push(...systems)
		return this
	}

	onPreUpdate(...systems: System[]) {
		this.#preUpdate.push(...systems)
		return this
	}

	/**
	 * put here the late queries that need access to added, removed or despawned
	 */
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

	preUpdate() {
		this.#preUpdate.forEach(update => update(this.ecs))
	}

	postUpdate() {
		this.#postUpdate.forEach(update => update(this.ecs))
	}

	update() {
		this.#update.forEach(update => update(this.ecs))
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
	toDespawn = new Set<Entity>()
	despawned = new Set<Entity>()
	states = new Set<State>()
	entities = new Set<Entity>()
	#components = new Map<Class, Map<Entity, InstanceType<Class>>>()
	#queries = new Set<Query>()
	core = new State(this)
	eventBus = new EventBus<Record<Class['name'], { type: 'added' | 'removed' ; entity: Entity }>>()
	constructor() {
		this.registerComponent(Entity)
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
		this.getComponentsMap(Entity).set(entity, entity)
		for (const component of components) {
			entity.addComponent(component)
		}

		this.entities.add(entity)
		return entity
	}

	isStateActive(state: State) {
		return this.states.has(state)
	}

	despawn(entity: Entity) {
		this.toDespawn.add(entity)
		for (const component of this.#components.keys()) {
			entity.removeComponent(component)
		}
		entity.children.forEach((children) => {
			this.despawn(children)
		})
	}

	#delete(entity: Entity) {
		this.despawned.delete(entity)
		if (entity.parent) {
			entity.parent?.children.delete(entity)
		}
		this.entities.delete(entity)
		for (const component of this.#components.values()) {
			component.delete(entity)
		}
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
		for (const entity of this.toDespawn) {
			this.entities.delete(entity)
			this.despawned.add(entity)
			this.toDespawn.delete(entity)
		}
		for (const state of this.states) {
			state.preUpdate()
		}
		for (const state of this.states) {
			state.update()
		}
		for (const state of this.states) {
			state.postUpdate()
		}

		for (const query of this.#queries) {
			query.clearTemp()
		}
		for (const entity of this.despawned) {
			this.despawned.delete(entity)
			this.#delete(entity)
		}
	}
}
