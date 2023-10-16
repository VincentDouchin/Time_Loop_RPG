import { ecs } from '@/globals/init'
import { LDTKEntityInstance } from '@/level/LDTKEntity'
import { Component } from '@/lib/ECS'

type direction = 'left' | 'right' | 'up' | 'down'

@Component(ecs)
export class Dungeon {
}
@Component(ecs)
export class Inside {
}
@Component(ecs)
export class InsideTrigger {
}
@Component(ecs)
export class Wall {
}
@Component(ecs)
export class Outside {
}
@Component(ecs)
export class DarkenWhenInside {
}
@Component(ecs)
export class JustEntered {
}
@Component(ecs)
export class Entrance extends LDTKEntityInstance<{ direction: direction }> {
}
@Component(ecs)
export class SignPost extends LDTKEntityInstance<{ dialog: string } > {
}
