import { updateSteps } from './overworldUi'
import { ecs } from '@/globals/init'
import { NavNode, getLevelName } from '@/level/NavNode'
import { Component, Entity } from '@/lib/ECS'

import { battles } from '@/constants/battles'
import type { direction } from '@/dungeon/spawnDungeon'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { battleState, dungeonState } from '@/main'
import { menuInputQuery } from '@/menus/menuInputs'
import { save, saveToLocalStorage } from '@/save/saveData'

@Component(ecs)
export class Navigator {
	constructor(public currentNode: Entity, public direction: direction | null = null) {}
}

@Component(ecs)
export class Navigating {}
const navigatorQuery = ecs.query.pick(Entity, Navigator, Position, TextureAtlas, Sprite).without(Navigating)
export const moveOverworldCharacter = () => {
	for (const [entity, navigator, position, atlas] of navigatorQuery.getAll()) {
		const inputs = menuInputQuery.extract()
		if (inputs) {
			let target: Entity | null = null
			let selectedDirection: direction | null = null
			for (const [input, direction] of [['Up', 'up'], ['Down', 'down'], ['Left', 'left'], ['Right', 'right']] as const) {
				if (inputs.get(input).justPressed || navigator.direction === direction) {
					if (navigator.direction === direction) {
						navigator.direction = null
					}
					const nodeEntity = navigator.currentNode
					const initialNodePos = nodeEntity.getComponent(Position)
					const node = nodeEntity.getComponent(NavNode)?.data.directions.find((ref) => {
						const pos = ref().getComponent(Position)
						if (pos && initialNodePos) {
							switch (direction) {
							case 'up' : return pos.x === initialNodePos.x && pos.y > initialNodePos.y
							case 'down' :return pos.x === initialNodePos.x && pos.y < initialNodePos.y
							case 'left' :return pos.x < initialNodePos.x && pos.y === initialNodePos.y
							case 'right' :return pos.x > initialNodePos.x && pos.y === initialNodePos.y
							}
						}
						return false
					})
					if (node) {
						target = node()
						if (direction === 'down' || direction === 'up') {
							atlas.directionY = direction
						}
						if (direction === 'left' || direction === 'right') {
							atlas.directionX = direction
						}
						selectedDirection = direction
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
							if (target && targetNode && selectedDirection) {
								atlas.state = 'idle'
								navigator.currentNode = target
								entity.removeComponent(Navigating)

								updateSteps(-1)
								save.lastDirection = selectedDirection
								saveToLocalStorage()
								save.lastNodeUUID = targetNode.id
								if (targetNode.data.Battle) {
									battleState.enable(battles[targetNode.data.Battle])
								} else {
									saveToLocalStorage()
									if (targetNode.data.Dungeon) {
										dungeonState.enable(getLevelName(targetNode.data.Dungeon), targetNode.data.Level, selectedDirection)
									}
								}
							}
						})
				}
			}
		}
	}
}
