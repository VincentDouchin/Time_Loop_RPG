import { OrthographicCamera } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { displayHealth, updateHealthDisplay } from './battle/health'
import { despawnBattle, spawnBattleBackground as spawnBattle } from './battle/spawnBattleBackground'
import { battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose } from './battle/spawnBattlers'
import { spawnDialogArea, startDialog } from './dungeon/NPC'
import { PlayerInputMap } from './dungeon/playerInputs'
import { movePlayer } from './dungeon/playerMovement'
import { exitDungeon, isPlayerInside, spawnDungeon } from './dungeon/spawnDungeon'
import { ecs } from './globals/init'
import { State } from './lib/ECS'
import { animateSprites } from './lib/animation'
import { adjustScreenSize, cameraFollow, initializeCameraBounds, render, spawnCamera, updateCameraZoom } from './lib/camera'
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
import { spawnOverworldCharacter } from './overworld/spawnOverworldCharacter'
import { ColorShader } from './shaders/ColorShader'
import { OutlineShader, addOutlineShader } from './shaders/OutlineShader'
import { addNineSlicetoUI } from './ui/NineSlice'
import { addUIElementsToDOM, spawnUIRoot } from './ui/UI'
import { setDefaultFontSize } from './ui/UiElement'
import { selectUiElement, unSelectDespawnMenus, updateMenus } from './ui/menu'
import { addToScene, addToWorld, registerShader } from './utils/registerComponents'

ecs.core
	.onEnter(createWorld, initThree, updateMousePosition, spawnCamera, spawnMenuInputs, spawnUIRoot, setDefaultFontSize)
	.onPreUpdate(updatePosition)
	.onUpdate(detectInteractions, updateMenus, addOutlineShader, animateSprites, addNineSlicetoUI, addUIElementsToDOM, selectUiElement, unSelectDespawnMenus, () => Tween.update(time.delta), adjustScreenSize(), initializeCameraBounds)
	.onPostUpdate(updateSpritePosition, cameraFollow, render, stepWorld)
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
	.onEnter(spawnBattle)
	.onUpdate(displayHealth, updateHealthDisplay, battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose)
	.onExit(despawnBattle)
	// .enable()

export const dungeonState = ecs.state
	.onEnter(spawnDungeon)
	.onUpdate(movePlayer, isPlayerInside, updateCameraZoom(7), startDialog, spawnDialogArea, exitDungeon)
	.enable()
State.exclusive(overworldState, battleState, dungeonState)
const animate = () => {
	ecs.update()
	time.tick(Date.now())
	requestAnimationFrame(animate)
}
await new Promise(resolve => setTimeout(resolve, 5000))
animate()
