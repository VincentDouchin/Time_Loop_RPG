import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { spawnLevel } from '@/level/spawnLevel'
import { Component } from '@/lib/ECS'
import { CameraBounds } from '@/lib/camera'

@Component(ecs)
export class Battle {}
export const currentLevel = assets.levels.minibattle.levels[0]
export const spawnBattleBackground = spawnLevel(currentLevel, new Battle(), new CameraBounds())
// export const spawnBattleBackground = () => {
// 	ecs.spawn(new Sprite(assets.background[177219]), new Position(), new Battle(), new CameraBounds())
// }
