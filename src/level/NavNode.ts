import { LDTKEntityInstance, type LDTKEntityRef } from './LDTKEntity'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'

interface NavNodeLDTK {
	up?: LDTKEntityRef
	down?: LDTKEntityRef
	left?: LDTKEntityRef
	right?: LDTKEntityRef
	type: 'Battle' | 'Encounter' | 'Start' | 'End'
	name: string
}

@Component(ecs)
export class NavNode extends LDTKEntityInstance<NavNodeLDTK> {}
