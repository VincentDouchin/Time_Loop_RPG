import { Block } from 'three-mesh-ui'
import { Color } from 'three'
import { defaultText } from './defaultText'
import { ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'
import { Interactable, InteractableType } from '@/lib/interactions'

@Component(ecs)
export class UI {}

@Component(ecs)
export class UIContainer {}

@Component(ecs)
export class FPSCounter {}

export const spawnUI = () => {
	ecs
		.spawn(new Block({ width: window.innerWidth, height: 100, backgroundOpacity: 0, padding: 20, justifyContent: 'space-between', alignItems: 'start', contentDirection: 'row' }))
}
