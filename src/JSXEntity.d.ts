/// <reference lib="DOM" />

type StandardProperties = import('csstype').StandardProperties

type Entity = import('@/lib/ECS').Entity
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace JSX {

	// IntrinsicElementMap grabs all the standard HTML tags in the TS DOM lib.
	type IntrinsicElements = IntrinsicElementMap & {
		'ui-element': { nineslice?: [HTMLCanvasElement, number, number], image?: [HTMLCanvasElement, number], style?: StandardProperties }
	}

	// The following are custom types, not part of TS's known JSX namespace:
	type IntrinsicElementMap = {
		[K in keyof HTMLElementTagNameMap]: {
			[k: string]: never
		}

	}

	interface Component {
		(properties?: { [key: string]: any }, children?: Node[]): Node
	}


}
