export const entries = <T extends Record<string, any>>(obj: T) => Object.entries(obj) as [keyof T, T[keyof T]][]

export const asyncMapValues = async< T extends Record<string, any>, F extends (arg: T[keyof T], key: keyof T) => any>(obj: T, fn: F) => {
	const res = {} as Record<keyof T, Awaited<ReturnType<F>>>
	for (const [key, val] of entries(obj)) {
		res[key] = await fn(val, key)
	}
	return res
}
export const mapValues = < T extends Record<string, any>, F extends (arg: T[keyof T], key: keyof T) => any>(obj: T, fn: F) => {
	const res = {} as Record<keyof T, ReturnType<F>>
	for (const [key, val] of entries(obj)) {
		res[key] = fn(val, key)
	}
	return res
}

export const groupByObject = <T extends Record<string, any>, F extends (key: keyof T) => string>(obj: T, fn: F) => {
	const res = {} as Record<string, Record<keyof T, T[keyof T]> >
	for (const [key, val] of entries(obj)) {
		const newKey = fn(key)
		res[newKey] ??= {} as Record<keyof T, T [keyof T]>
		res[newKey][key] = val
	}
	return res as { [key in ReturnType<F>]: Record<keyof T, T[keyof T]> }
}

export const mapKeys = <K extends string, T extends Record<string, any>, F extends (key: keyof T) => K>(obj: T, fn: F) => {
	const res = {} as { [k in K]: T[keyof T] }
	for (const [key, val] of entries(obj)) {
		const newKey = fn(key)
		res[newKey] = val
	}
	return res
}
export const reduce = <T extends Record<string, any>, F extends (key: keyof T, val: T[keyof T]) => Record<string, any>>(obj: T, fn: F) => {
	return entries(obj).reduce((acc, v) => {
		return { ...acc, ...fn(...v) }
	}, {}) as ReturnType<F>
}