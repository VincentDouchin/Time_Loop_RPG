import { assets } from '@/globals/assets'
import { ecs } from '@/globals/init'
import { spawnLevel } from '@/level/spawnOverworld'
import { Component } from '@/lib/ECS'

@Component(ecs)
export class Battle {}

export const spawnBattleBackground = spawnLevel(assets.levels.battle.levels[0], new Battle())
