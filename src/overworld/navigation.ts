import { ecs } from '@/globals/init'
import { NavNode } from '@/level/NavNode'
import { Component, Entity } from '@/lib/ECS'

import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { battleState, dungeonState } from '@/main'
import { menuInputQuery } from '@/menus/menuInputs'

@Component(ecs)
export class Navigator {
	constructor(public currentNode: NavNode) {}
}

@Component(ecs)
export class Navigating {}

const navigatorQuery = ecs.query.pick(Entity, Navigator, Position, TextureAtlas, Sprite).without(Navigating)
export const moveOverworldCharacter = () => {
	for (const [entity, navigator, position, atlas] of navigatorQuery.getAll()) {
		const inputs = menuInputQuery.extract()
		if (inputs) {
			let target: Entity | null = null
			for (const [input, direction] of [['Up', 'up'], ['Down', 'down'], ['Left', 'left'], ['Right', 'right']] as const) {
				const node = navigator.currentNode.data[direction]
				if (inputs.get(input).justPressed && node) {
					target = node()
					if (direction === 'down' || direction === 'up') {
						atlas.directionY = direction
					}
					if (direction === 'left' || direction === 'right') {
						atlas.directionX = direction
					}
				}
			}
			if (target) {
				const targetPosition = target.getComponent(Position)
				const targetNode = target.getComponent(NavNode)
				if (targetPosition) {
					entity.addComponent(new Navigating())
					atlas.state = 'walk'
					new Tween(position.distanceTo(targetPosition) * 20)
						.onUpdate(y => position.y = y, position.y, targetPosition.y)
						.onUpdate(x => position.x = x, position.x, targetPosition.x)
						.onComplete(() => {
							if (targetNode) {
								atlas.state = 'idle'
								navigator.currentNode = targetNode
								entity.removeComponent(Navigating)
								if (targetNode.data.type === 'Battle') {
									battleState.enable()
								}
								if (targetNode.data.type === 'Dungeon') {
									dungeonState.enable()
								}
							}
						})
				}
			}
		}
	}
}
