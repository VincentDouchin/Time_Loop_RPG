import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
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
	id: string
	constructor(private entityInstance: EntityInstance) {
		this.id = entityInstance.iid
		for (const field of this.entityInstance.fieldInstances) {
			this.data[field.__identifier as keyof EntityInstanceDef] = this.getValue(field)
		}
	}

	getValue(field: FieldInstance) {
		if (field.__type === 'EntityRef') {
			return () => LDTKEntityInstance.refs[field.__value.entityIid]
		} else if (field.__type === 'Array<EntityRef>') {
			return field.__value.map((val: { entityIid: string }) => () => LDTKEntityInstance.refs[val.entityIid])
		} else {
			return field.__value
		}
	}

	position(layer: LayerInstance) {
		const w = layer.__cWid * layer.__gridSize
		const h = layer.__cHei * layer.__gridSize
		return new Position(
			this.entityInstance.px[0] - w / 2,
			-this.entityInstance.px[1] + h / 2,
		)
	}

	body(sensor = false) {
		return [
			RigidBodyDesc.fixed().lockRotations(),
			ColliderDesc
				.cuboid(this.entityInstance.width / 2, this.entityInstance.height / 2)
				.setSensor(sensor),
		]
	}

	static register(entity: Entity, entityInstance: EntityInstance) {
		LDTKEntityInstance.refs[entityInstance.iid] = entity
	}
}
