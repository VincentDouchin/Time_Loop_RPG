import { OrthographicCamera } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { displayHealth, updateHealthDisplay } from './battle/health'
import { spawnBattleBackground } from './battle/spawnBattleBackground'
import { battleTurn, outlineSelectedEnemy, removeDeadBattlers, spawnBattlers, winOrLose } from './battle/spawnBattlers'
import { spawnOverworldCharacter } from './character/spawnOverworldCharacter'
import { ecs } from './globals/init'
import { despawnOverworld, spawnOverworld } from './level/spawnOverworld'
import { animateSprites } from './lib/animation'
import { adjustScreenSize, cameraFollow, render, spawnCamera } from './lib/camera'
import { resetInputs } from './lib/inputs'
import { detectInteractions, updateMousePosition } from './lib/interactions'
import { initThree } from './lib/rendering'
import { Sprite } from './lib/sprite'
import { time } from './lib/time'
import { updateSpritePosition } from './lib/transforms'
import { Tween } from './lib/tween'
import { MenuInputMap, spawnMenuInputs } from './menus/menuInputs'
import { moveOverworldCharacter } from './navigation/navigation'
import { ColorShader } from './shaders/ColorShader'
import { OutlineShader, addOutlineShader } from './shaders/OutlineShader'
import { addNineSlicetoUI } from './ui/NineSlice'
import { addUIElementsToDOM, spawnUIRoot } from './ui/UI'
import { selectUiElement, unSelectDespawnMenus, updateMenus } from './ui/menu'
import { addToScene, registerShader } from './utils/registerComponents'
import { setDefaultFontSize } from './ui/UiElement'
import { addShadow } from './character/shadow'
import { movePlayer, spawnDungeon, spawnPlayer, updateCamera } from './dungeon/spawnDungeon'
import { PlayerInputMap } from './dungeon/playerInputs'

ecs.core
	.onEnter(initThree, updateMousePosition, spawnCamera, spawnMenuInputs, spawnUIRoot, setDefaultFontSize)
	.onUpdate(detectInteractions, updateMenus, addOutlineShader, animateSprites, render, updateSpritePosition, addNineSlicetoUI, addUIElementsToDOM, selectUiElement, unSelectDespawnMenus, () => Tween.update(time.delta), adjustScreenSize(), cameraFollow)
	.enable()

addToScene(OrthographicCamera, Sprite, CSS2DObject)
registerShader(ColorShader, OutlineShader)
resetInputs(MenuInputMap, PlayerInputMap)

export const overworldState = ecs.state
	.onEnter(spawnOverworld)
	.onUpdate(moveOverworldCharacter, spawnOverworldCharacter)
	.onExit(despawnOverworld)
	// .enable()

export const battleState = ecs.state
	.onEnter(() => overworldState.disable(), spawnBattleBackground, spawnBattlers)
	.onUpdate(displayHealth, updateHealthDisplay, battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose, addShadow)
	.enable()

export const dungeonState = ecs.state
	.onEnter(spawnDungeon, spawnPlayer)
	.onUpdate(updateCamera, movePlayer)
	// .enable()

const animate = () => {
	ecs.update()
	time.tick(Date.now())
	requestAnimationFrame(animate)
}
animate()
