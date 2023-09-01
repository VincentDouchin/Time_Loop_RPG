import type { EntityInstance, FieldInstance, LayerInstance } from './LDTK'
import { ecs } from '@/globals/init'
import type { Entity } from '@/lib/ECS'
import { Component } from '@/lib/ECS'
import { Position } from '@/lib/transforms'

export type LDTKEntityRef = () => Entity

@Component(ecs)
export class LDTKEntityInstance<EntityInstanceDef extends Record<string, any> > {
	static refs: Record<string, Entity> = {}
	data = {} as EntityInstanceDef
	constructor(private entityInstance: EntityInstance) {
		for (const field of this.entityInstance.fieldInstances) {
			// if (field.__type === 'Array<EntityRef>') {
			// 	this.data[field.__identifier as keyof EntityInstanceDef] = field.__value.map((val: ForcedRefs['ReferenceToAnEntityInstance']) => () => LDTKEntityInstance.refs[val.entityIid])
			// } else
			this.data[field.__identifier as keyof EntityInstanceDef] = this.getValue(field)
		}
	}

	getValue(field: FieldInstance) {
		if (!field.__value) {
			return null
		} else if (field.__type === 'EntityRef') {
			return () => LDTKEntityInstance.refs[field.__value.entityIid]
		} else {
			return field.__value
		}
	}

	withPosition(layer: LayerInstance) {
		const w = layer.__cWid * layer.__gridSize
		const h = layer.__cHei * layer.__gridSize
		return [this, new Position(this.entityInstance.px[0] - w / 2, -this.entityInstance.px[1] + h / 2)]
	}

	static register(entity: Entity, entityInstance: EntityInstance) {
		LDTKEntityInstance.refs[entityInstance.iid] = entity
	}
	// static new<EntityInstanceDef extends { [key: string]: any }>(entityInstance: EntityInstance, position: boolean, ...tags: Class[]) {
	// 	return (parent: Entity) => {
	// 		const entity = parent.spawn(new LDTKEntityInstance<EntityInstanceDef>(entityInstance), ...tags)

	// 		LDTKEntityInstance.refs[entityInstance.iid] = entity
	// 		if (position) {
	// 			entity.addComponent(new Position(entityInstance.px[0], entityInstance.px[1]))
	// 		}
	// 		return entity
	// 	}
	// }
}
