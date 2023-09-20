import { LDTKEntityInstance, type LDTKEntityRef } from './LDTKEntity'
import type { battles } from '@/constants/battles'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { getFileName } from '@/utils/assetLoader'

export type levelPath = string & { __type: 'levelPath' }

export const getLevelName = (levelPath: levelPath) => getFileName(levelPath) as levels

interface NavNodeLDTK {
	up: LDTKEntityRef | null
	down: LDTKEntityRef | null
	left: LDTKEntityRef | null
	right: LDTKEntityRef | null
	Battle: keyof typeof battles | null
	Start: boolean
	Dungeon: levelPath
}

@Component(ecs)
export class NavNode extends LDTKEntityInstance<NavNodeLDTK> {}
