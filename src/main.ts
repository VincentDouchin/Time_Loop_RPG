import { OrthographicCamera } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { banditCutscene, battleDialog } from './battle/battleCutscene'
import { displayHealth, savePlayerHealth, updateHealthDisplay } from './battle/health'
import { despawnBattle, spawnBattleBackground as spawnBattle } from './battle/spawnBattleBackground'
import { battleTurn, despawnBattleMenu, outlineSelectedEnemy, removeDeadBattlers, winOrLose } from './battle/spawnBattlers'
import type { BattleData } from './constants/battles'
import { startDialogDungeon } from './dungeon/NPC'
import { PlayerInputMap } from './dungeon/playerInputs'
import { movePlayer } from './dungeon/playerMovement'
import type { DungeonRessources } from './dungeon/spawnDungeon'
import { Dungeon, allowPlayerToExit, exitDungeon, isPlayerInside, setDungeonState, spawnDungeon } from './dungeon/spawnDungeon'
import { despawnEntities, ecs } from './globals/init'
import { State } from './lib/ECS'
import { animateSprites } from './lib/animation'
import { adjustScreenSize, cameraFollow, initializeCameraBounds, render, spawnCamera, updateCameraZoom } from './lib/camera'
import { disableTouchJoystick, enableTouchJoystick, registerInput } from './lib/inputs'
import { detectInteractions, updateMousePosition } from './lib/interactions'
import { initThree } from './lib/rendering'
import { Sprite } from './lib/sprite'
import { time } from './lib/time'
import { stepWorld, updatePosition, updateSpritePosition } from './lib/transforms'
import { Tween } from './lib/tween'
import { MenuInputMap, clickOnMenuInput, spawnMenuInputs } from './menus/menuInputs'
import { triggerApocalypse } from './overworld/apocalypse'
import { addNavigationArrows, moveOverworldCharacter, pickupOverworldTreasure, removeNavigationMenu } from './overworld/navigation'
import { OverWorldUI, StepsUi, spawnStepsUi } from './overworld/overworldUi'
import { setInitialState } from './overworld/setInitialState'
import { despawnOverworld, setOverwolrdState, spawnOverworld } from './overworld/spawnOverworld'
import { saveToLocalStorage } from './save/saveData'
import { ApocalypseShader, updateApocalypseShader } from './shaders/ApocalypseShader'
import { ColorShader } from './shaders/ColorShader'
import { OutlineShader, addOutlineShader } from './shaders/OutlineShader'
import { addNineSlicetoUI } from './ui/NineSlice'
import { addUIElementsToDOM, spawnUIRoot } from './ui/UI'
import { setDefaultFontSize } from './ui/UiElement'
import { changeTextureOnSelected, selectUiElement, unSelectDespawnMenus, updateMenus } from './ui/menu'
import { addToScene, addToWorld, registerFullScreenShader, registerShader } from './utils/registerComponents'
import { openInventory, spawnInventoryToggle } from './overworld/InventoryUi'
import { ItemPickupShader } from './shaders/ItemPickupShader'

// !Lib
ecs
	.core.onEnter(initThree, updateMousePosition, spawnCamera, spawnMenuInputs, spawnUIRoot, setDefaultFontSize)
	.onPreUpdate(updatePosition)
	.onUpdate(detectInteractions, updateMenus, addOutlineShader, animateSprites, addNineSlicetoUI, addUIElementsToDOM, selectUiElement, unSelectDespawnMenus, () => Tween.update(time.delta), adjustScreenSize(), initializeCameraBounds, registerShader(ColorShader, OutlineShader, ItemPickupShader), registerFullScreenShader(ApocalypseShader), addToWorld, updateApocalypseShader, changeTextureOnSelected, clickOnMenuInput)
	.onPostUpdate(updateSpritePosition, cameraFollow, render, stepWorld)
	.enable()

// !Plugins
ecs.addPlugin(addToScene(OrthographicCamera, Sprite, CSS2DObject))
	.addPlugin(registerInput(MenuInputMap, PlayerInputMap))

// ! States
export const overworldState = ecs.state()
	.onEnter(spawnOverworld, spawnStepsUi, setOverwolrdState, spawnInventoryToggle)
	.onUpdate(moveOverworldCharacter, triggerApocalypse, addNavigationArrows, removeNavigationMenu, pickupOverworldTreasure, openInventory)
	.onExit(despawnOverworld, despawnEntities(OverWorldUI))

export const battleState = ecs.state<[BattleData]>()
	.onEnter(spawnBattle)
	.onUpdate(displayHealth, updateHealthDisplay, battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose, savePlayerHealth, battleDialog, banditCutscene)
	.onExit(despawnBattle, saveToLocalStorage, despawnBattleMenu)

export const dungeonState = ecs.state<DungeonRessources>()
	.onEnter(spawnDungeon, setDungeonState, enableTouchJoystick)
	.onUpdate(movePlayer, isPlayerInside, updateCameraZoom(7), startDialogDungeon, exitDungeon, allowPlayerToExit)
	.onExit(disableTouchJoystick, despawnEntities(Dungeon))

State.exclusive(overworldState, battleState, dungeonState)

setInitialState()

// ! Game loop
const animate = async (delta: number) => {
	time.tick(delta)
	ecs.update()
	requestAnimationFrame(animate)
}

animate(performance.now())
