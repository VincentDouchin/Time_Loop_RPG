import { tween } from 'shifty'
import { ecs } from '@/globals/init'
import { NavNode } from '@/level/NavNode'
import type { Entity } from '@/lib/ECS'
import { Component } from '@/lib/ECS'
import { Position } from '@/lib/transforms'
import { menuInputQuery } from '@/menus/menuInputs'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import type { characterStates } from '@/character/spawnOverworldCharacter'
import { battleState } from '@/main'

@Component(ecs)
export class Navigator {
	constructor(public currentNode: NavNode) {}
}

@Component(ecs)
export class Navigating {}

const navigatorQuery = ecs.query.pick(Navigator, Position, TextureAtlas<characterStates>, Sprite).without(Navigating)
export const moveOverworldCharacter = () => {
	for (const [entity, navigator, position, atlas, sprite] of navigatorQuery.getEntities()) {
		const inputs = menuInputQuery.extract()
		if (inputs) {
			let target: Entity | null = null
			for (const [input, direction] of [['Up', 'up'], ['Down', 'down'], ['Left', 'left'], ['Right', 'right']] as const) {
				const node = navigator.currentNode.data[direction]
				if (inputs.get(input).justPressed && node) {
					target = node()
					if (input === 'Right') {
						sprite.flip = false
					}
					if (input === 'Left') {
						sprite.flip = true
					}
				}
			}
			if (target) {
				const targetPosition = target.getComponent(Position)
				const targetNode = target.getComponent(NavNode)
				if (targetPosition) {
					entity.addComponent(new Navigating())
					atlas.state = 'run'
					tween({
						render(state) {
							position.x = Number(state.x)
							position.y = Number(state.y)
						},
						duration: position.distanceTo(targetPosition) * 20,
						from: { x: position.x, y: position.y },
						to: { x: targetPosition.x, y: targetPosition.y },
					}).then((data) => {
						if (targetNode) {
							atlas.state = 'idle'
							navigator.currentNode = targetNode
							entity.removeComponent(Navigating)
							if (targetNode.data.type === 'Battle') {
								battleState.enable()
							}
						}
						return data
					})
				}
			}
		}
	}
}
