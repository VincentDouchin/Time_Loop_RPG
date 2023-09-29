import { Group } from 'three'
import { easing } from 'ts-easing'
import { updateSteps } from './overworldUi'
import { assets, ecs } from '@/globals/init'
import { NavNode, getLevelName } from '@/level/NavNode'
import { Component, Entity } from '@/lib/ECS'
import { battles } from '@/constants/battles'
import { items } from '@/constants/items'
import type { direction } from '@/dungeon/spawnDungeon'
import { Interactable } from '@/lib/interactions'
import { Sprite, TextureAtlas } from '@/lib/sprite'
import { Position } from '@/lib/transforms'
import { Tween } from '@/lib/tween'
import { battleState, dungeonState } from '@/main'
import { MenuInputInteractable, menuInputQuery } from '@/menus/menuInputs'
import { save, saveToLocalStorage } from '@/save/saveData'
import { UIElement } from '@/ui/UiElement'
import { IncrementOnSelected, Menu } from '@/ui/menu'
import { sleep } from '@/utils/timing'

@Component(ecs)
export class Navigator {
	constructor(public direction: direction | null = null) {}
}

@Component(ecs)
export class DecidingDirection {}
@Component(ecs)
export class CurrentNode {}

const navigatorQuery = ecs.query.pick(Entity, Navigator, Position, TextureAtlas, Sprite).with(DecidingDirection)
const currentNodeQuery = ecs.query.pick(Entity, Position, NavNode).with(CurrentNode)
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
					const currentNode = currentNodeQuery.getSingle()
					if (currentNode) {
						const [_entity, initialNodePos, currentNavNode] = currentNode
						const node = currentNavNode.data.directions.find((ref) => {
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
						if (direction === 'down' || direction === 'up') {
							atlas.directionY = direction
						}
						if (direction === 'left' || direction === 'right') {
							atlas.directionX = direction
						}
						if (node) {
							target = node()
							selectedDirection = direction
						}
					}
				}
			}
			if (target) {
				const targetPosition = target.getComponent(Position)
				const targetNode = target.getComponent(NavNode)
				if (targetPosition) {
					atlas.state = 'walk'
					entity.removeComponent(DecidingDirection)
					new Tween(position.distanceTo(targetPosition) * 20)
						.onUpdate(y => position.y = y, position.y, targetPosition.y)
						.onUpdate(x => position.x = x, position.x, targetPosition.x)
						.onComplete(() => {
							if (target && targetNode && selectedDirection) {
								atlas.state = 'idle'
								currentNodeQuery.extract()?.removeComponent(CurrentNode)
								target.addComponent(new CurrentNode())
								ecs.onNextTick(() => entity.addComponent(new DecidingDirection()))
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

@Component(ecs)
export class NavigationMenu {}

const navigationMenuToRemoveQuery = ecs.query.pick(Entity).with(NavigationMenu)
const decidedDirectionQuery = ecs.query.removed(DecidingDirection)
export const removeNavigationMenu = () => {
	if (decidedDirectionQuery.size) {
		for (const [entity] of navigationMenuToRemoveQuery.getAll()) {
			entity.despawn()
		}
	}
}

const needToAddArrowQuery = ecs.query.pick(Entity).added(DecidingDirection)
export const addNavigationArrows = () => {
	for (const [entity] of needToAddArrowQuery.getAll()) {
		const menu = new Menu([[null, null, null], [null, null, null], [null, null, null]])
		const navigationMenu = entity.spawn(new NavigationMenu(), new Position(), new Group(), menu)
		const currentNode = currentNodeQuery.getSingle()
		if (currentNode) {
			const [_entity, pos, navNode] = currentNode
			const directions = navNode.data.directions
			if (directions && pos) {
				for (const direction of directions) {
					const nodeDirection = direction()
					const directionPos = nodeDirection.getComponent(Position)
					if (directionPos) {
						const arrowX = Math.sign(directionPos.x - pos.x)
						const arrowY = Math.sign(directionPos.y - pos.y)
						let arrow: Capitalize<direction> = 'Down'
						if (arrowX > 0) arrow = 'Right'
						if (arrowX < 0) arrow = 'Left'
						if (arrowY > 0) arrow = 'Up'
						const [sprite, _animator, atlas] = TextureAtlas.single([assets.ui[`arrow${arrow}`].texture, assets.ui[`arrow${arrow}Selected`].texture])
						const arrowEntity = navigationMenu.spawn(new Position(arrowX * 16, arrowY * 16), sprite, atlas, new IncrementOnSelected(), new MenuInputInteractable(arrow), new Interactable())
						menu.entities[arrowX + 1][arrowY + 1] = arrowEntity
					}
				}
			}
		}
	}
}

export const pickupOverworldTreasure = () => {
	for (const [_entity, _pos, navNode] of currentNodeQuery.getAll()) {
		const treasure = navNode.data.Treasure
		if (treasure && !save.treasureFound.includes(treasure)) {
			const item = items[treasure]
			const img = UIElement.fromCanvas(item.sprite, 10)?.setStyles({ margin: 'auto' })
			// ecs.spawn(createDebugtexture(100, 100), new ItemPickupShader(0.5), new Position(_pos.x, _pos.y))
			ecs.spawn(img)
			navNode.data.Treasure = null
			new Tween(1500)
				.easing(easing.elastic)
				.onUpdate(scale => img?.setStyle('scale', scale), 0.5, 2)
				.onComplete(() => {
					sleep(2000).then(() => {
						save.treasureFound.push(treasure)
						saveToLocalStorage()
					})
				})
		}
	}
}
