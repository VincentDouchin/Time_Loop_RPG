import { OrthographicCamera } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { displayHealth, updateHealthDisplay } from './battle/health'
import { spawnBattleBackground } from './battle/spawnBattleBackground'
import { battleTurn, outlineSelectedEnemy, removeDeadBattlers, spawnBattlers, winOrLose } from './battle/spawnBattlers'
import { PlayerInputMap } from './dungeon/playerInputs'
import { isPlayerInside, movePlayer, spawnDungeon, spawnPlayer, updateCamera } from './dungeon/spawnDungeon'
import { ecs } from './globals/init'
import { animateSprites } from './lib/animation'
import { adjustScreenSize, cameraFollow, initializeCameraBounds, render, spawnCamera } from './lib/camera'
import { resetInputs } from './lib/inputs'
import { detectInteractions, updateMousePosition } from './lib/interactions'
import { initThree } from './lib/rendering'
import { Sprite } from './lib/sprite'
import { time } from './lib/time'
import { updatePosition, updateSpritePosition } from './lib/transforms'
import { Tween } from './lib/tween'
import { createWorld, stepWorld } from './lib/world'
import { MenuInputMap, spawnMenuInputs } from './menus/menuInputs'
import { moveOverworldCharacter } from './overworld/navigation'
import { despawnOverworld, spawnOverworld } from './overworld/spawnOverworld'
import { ColorShader } from './shaders/ColorShader'
import { OutlineShader, addOutlineShader } from './shaders/OutlineShader'
import { addNineSlicetoUI } from './ui/NineSlice'
import { addUIElementsToDOM, spawnUIRoot } from './ui/UI'
import { setDefaultFontSize } from './ui/UiElement'
import { selectUiElement, unSelectDespawnMenus, updateMenus } from './ui/menu'
import { addToScene, addToWorld, registerShader } from './utils/registerComponents'
import { spawnOverworldCharacter } from './overworld/spawnOverworldCharacter'
import { State } from './lib/ECS'
import { spawnDialogArea, startDialog } from './dungeon/NPC'

ecs.core
	.onEnter(createWorld, initThree, updateMousePosition, spawnCamera, spawnMenuInputs, spawnUIRoot, setDefaultFontSize)
	.onUpdate(detectInteractions, updateMenus, addOutlineShader, animateSprites, addNineSlicetoUI, addUIElementsToDOM, selectUiElement, unSelectDespawnMenus, () => Tween.update(time.delta), adjustScreenSize(), initializeCameraBounds)
	.onPostUpdate(updatePosition, updateSpritePosition, stepWorld, cameraFollow, render)
	.enable()

addToScene(OrthographicCamera, Sprite, CSS2DObject)
registerShader(ColorShader, OutlineShader)
resetInputs(MenuInputMap, PlayerInputMap)
addToWorld()
export const overworldState = ecs.state
	.onEnter(spawnOverworld)
	.onUpdate(moveOverworldCharacter, spawnOverworldCharacter)
	.onExit(despawnOverworld)
	// .enable()

export const battleState = ecs.state
	.onEnter(spawnBattleBackground, spawnBattlers)
	.onUpdate(displayHealth, updateHealthDisplay, battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose)
	// .enable()

export const dungeonState = ecs.state
	.onEnter(spawnDungeon, spawnPlayer)
	.onUpdate(movePlayer, isPlayerInside, updateCamera, startDialog, spawnDialogArea)
	.enable()
State.exclusive(overworldState, battleState, dungeonState)
const animate = () => {
	ecs.update()
	time.tick(Date.now())
	requestAnimationFrame(animate)
}
animate()
