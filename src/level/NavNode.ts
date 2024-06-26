import { LDTKEntityInstance, type LDTKEntityRef } from './LDTKEntity'
import type { battles } from '@/constants/battles'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { getFileName } from '@/utils/assetLoader'
import type LDTKEnums from '@/constants/exports/LDTKEnums'
import type { key } from '@/constants/dialogs'

export type levelPath = string & { __type: 'levelPath' }

export const getLevelName = (levelPath: levelPath) => getFileName(levelPath) as levels

interface NavNodeLDTK {
	directions: LDTKEntityRef[]
	Battle: keyof typeof battles | null
	Start: boolean | null
	Dungeon: levelPath | null
	Level: number
	Treasure: typeof LDTKEnums['treasure'][number] | null
	lock: key | null
}

@Component(ecs)
export class NavNode extends LDTKEntityInstance<NavNodeLDTK> {}
