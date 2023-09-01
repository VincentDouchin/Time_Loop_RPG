export type EventMap = Record<string, any>
export type EventName<E extends EventMap> = keyof E

export interface Event<E extends EventMap, Name extends EventName<E>> {
	type: Name
	data: E[Name]
}

export type EventCallback<E extends EventMap, Name extends EventName<E>> = (event: Event<E, Name>['data']) => void

export type Subscribers<E extends EventMap> = {
	[Name in EventName<E>]?: Set<EventCallback<E, Name>>
}

export class EventBus<E extends EventMap> {
	subscribers: Subscribers<E> = {}

	subscribe<Name extends EventName<E>>(event: Name, callback: EventCallback<E, Name>) {
		const subscribers = this.subscribers[event]

		subscribers && subscribers.add(callback)
		return () => this.unsubscribe<Name>(event, callback)
	}

	registerEvent<Name extends EventName<E>>(event: Name) {
		this.subscribers[event] = new Set()
	}

	unsubscribe<Name extends EventName<E>>(event: Name, callback: EventCallback<E, Name>) {
		const subscribers = this.subscribers[event]
		if (subscribers) {
			subscribers.delete(callback)
		}
	}

	publish<Name extends EventName<E>>(event: Name, data: Event<E, Name>['data']) {
		const subscribers = this.subscribers[event]
		if (subscribers?.size) {
			for (const callback of subscribers) {
				callback(data)
			}
		}
	}
}
