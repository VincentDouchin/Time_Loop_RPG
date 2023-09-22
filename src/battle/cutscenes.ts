import { despawnEntities, ecs } from '@/globals/init'
import { Component } from '@/lib/ECS'

@Component(ecs)
export class Cutscene {}

export const despwawnCutscene = despawnEntities(Cutscene)
