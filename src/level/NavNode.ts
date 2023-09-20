import { LDTKEntityInstance, type LDTKEntityRef } from './LDTKEntity'
import type { battles } from '@/constants/battles'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'

interface NavNodeLDTK {
	up: LDTKEntityRef | null
	down: LDTKEntityRef | null
	left: LDTKEntityRef | null
	right: LDTKEntityRef | null
	Battle: keyof typeof battles | null
}

@Component(ecs)
export class NavNode extends LDTKEntityInstance<NavNodeLDTK> {}
