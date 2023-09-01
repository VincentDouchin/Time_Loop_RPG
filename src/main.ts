import { OrthographicCamera } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { displayHealth, updateHealthDisplay } from './battle/health'
import { spawnBattleBackground } from './battle/spawnBattleBackground'
import { battleTurn, spawnBattlers, takeAction } from './battle/spawnBattlers'
import { spawnOverworldCharacter } from './character/spawnOverworldCharacter'
import { ecs } from './globals/init'
import { despawnOverworld, spawnOverworld } from './level/spawnOverworld'
import { animateSprites } from './lib/animation'
import { render, spawnCamera } from './lib/camera'
import { updateInputs } from './lib/inputs'
import { detectInteractions, updateMousePosition } from './lib/interactions'
import { initThree } from './lib/rendering'
import { Sprite } from './lib/sprite'
import { time } from './lib/time'
import { updateSpritePosition } from './lib/transforms'
import { Tween } from './lib/tween'
import { spawnMenuInputs } from './menus/menuInputs'
import { moveOverworldCharacter } from './navigation/navigation'
import { ColorShader } from './shaders/ColorShader'
import { addNineSlicetoUI } from './ui/NineSlice'
import { addUIElementsToDOM, spawnUIRoot } from './ui/UI'
import { addToScene, registerShader } from './utils/registerComponents'

ecs.core
	.onEnter(initThree, updateMousePosition, spawnCamera, spawnMenuInputs, spawnUIRoot)
	.onPreUpdate(animateSprites, () => Tween.update(time.delta), detectInteractions)
	.onUpdate()
	.onPostUpdate(render, updateSpritePosition, addNineSlicetoUI, addUIElementsToDOM)
	.enable()

addToScene(OrthographicCamera, Sprite, CSS2DObject)
registerShader(Sprite)(ColorShader)
updateInputs()

export const overworldState = ecs.state
	.onEnter(spawnOverworld, spawnOverworldCharacter)
	.onUpdate(moveOverworldCharacter)
	.onExit(despawnOverworld)
	// .enable()

export const battleState = ecs.state
	.onEnter(() => overworldState.disable(), spawnBattleBackground, spawnBattlers)
	.onUpdate(battleTurn, takeAction, displayHealth, updateHealthDisplay)
	.enable()

const animate = () => {
	ecs.update()
	time.tick(Date.now())
	requestAnimationFrame(animate)
}
animate()
