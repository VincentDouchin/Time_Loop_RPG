import { OrthographicCamera } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { banditCutscene, battleDialog } from './battle/battleCutscene'
import { displayHealth, savePlayerHealth, updateHealthDisplay } from './battle/health'
import { despawnBattle, spawnBattle } from './battle/spawnBattleBackground'
import { battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose } from './battle/spawnBattlers'
import type { BattleData } from './constants/battles'
import { addTalkingIcon, startDialogDungeon } from './dungeon/NPC'
import { hideThanks, showEndOfDemo } from './dungeon/endOfDemo'
import { PlayerInputMap } from './dungeon/playerInputs'
import { movePlayer } from './dungeon/playerMovement'
import type { direction } from './dungeon/spawnDungeon'
import { Dungeon, allowPlayerToExit, exitDungeon, isPlayerInside, setDungeonState, spawnDungeon } from './dungeon/spawnDungeon'
import { despawnEntities, ecs } from './globals/init'
import { State, SystemSet } from './lib/ECS'
import { animateSprites } from './lib/animation'
import { adjustScreenSize, cameraFollow, initializeCameraBounds, render, spawnCamera, updateCameraZoom } from './lib/camera'
import { changeControls, disableTouchJoystick, enableTouchJoystick, registerInput } from './lib/inputs'
import { detectInteractions, updateMousePosition } from './lib/interactions'
import { initThree } from './lib/rendering'
import { Sprite } from './lib/sprite'
import { time } from './lib/time'
import { stepWorld, updatePosition, updateSpritePosition } from './lib/transforms'
import { Tween } from './lib/tween'
import { MenuInputMap, clickOnMenuInput, spawnMenuInputs } from './menus/menuInputs'
import { Inventory, openInventory, spawnInventoryToggle } from './overworld/InventoryUi'
import { triggerApocalypse } from './overworld/apocalypse'
import { addNavigationArrows, moveOverworldCharacter, pickupOverworldTreasure, removeNavigationMenu } from './overworld/navigation'
import { spawnStepsUi } from './overworld/overworldUi'
import { setInitialState } from './overworld/setInitialState'
import { despawnOverworld, setOverwolrdState, spawnOverworld } from './overworld/spawnOverworld'
import { save, saveToLocalStorage } from './save/saveData'
import { ApocalypseShader, updateApocalypseShader } from './shaders/ApocalypseShader'
import { ColorShader } from './shaders/ColorShader'
import { ItemPickupShader } from './shaders/ItemPickupShader'
import { OutlineShader, addOutlineShader } from './shaders/OutlineShader'
import { addNineSlicetoUI } from './ui/nineSlice'
import { addUIElementsToDOM, spawnUIRoot } from './ui/UI'
import { BattleUI, OverWorldUI, setDefaultFontSize } from './ui/UiElement'
import { selectEntities, unSelectDespawnMenus, updateMenus } from './ui/menu'
import { addToScene, addToWorld, registerFullScreenShader, registerShader } from './utils/registerComponents'

// !Lib
ecs
	.core.onEnter(initThree, updateMousePosition, spawnCamera, spawnMenuInputs, spawnUIRoot, setDefaultFontSize, changeControls)
	.onPreUpdate(detectInteractions, updatePosition, clickOnMenuInput)
	.onUpdate(updateMenus, addOutlineShader, animateSprites, addNineSlicetoUI, addUIElementsToDOM, selectEntities, unSelectDespawnMenus, () => Tween.update(time.delta), adjustScreenSize(), initializeCameraBounds, registerShader(ColorShader, OutlineShader, ItemPickupShader), registerFullScreenShader(ApocalypseShader), addToWorld, updateApocalypseShader)
	.onPostUpdate(updateSpritePosition, cameraFollow, render, stepWorld)
	.enable()

// !Plugins
ecs.addPlugin(addToScene(OrthographicCamera, Sprite, CSS2DObject))
	.addPlugin(registerInput(MenuInputMap, PlayerInputMap))

// ! States
export const overworldState = ecs.state()
	.onEnter(showEndOfDemo, spawnOverworld, SystemSet(spawnStepsUi).runIf(() => !save.finishedDemo), setOverwolrdState, spawnInventoryToggle)
	.onUpdate(moveOverworldCharacter, SystemSet(triggerApocalypse).runIf(() => !save.finishedDemo), addNavigationArrows, removeNavigationMenu, pickupOverworldTreasure, openInventory, hideThanks)
	.onExit(despawnOverworld, despawnEntities(OverWorldUI, Inventory))

export type battleRessources = [BattleData]
export const battleState = ecs.state<battleRessources>()
	.onEnter(spawnBattle)
	.onUpdate(displayHealth, updateHealthDisplay, battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose, savePlayerHealth, battleDialog, banditCutscene)
	.onExit(despawnBattle, saveToLocalStorage, despawnEntities(BattleUI))

export type dungeonRessources = [levels, number, direction]
export const dungeonState = ecs.state<dungeonRessources>()
	.onEnter(spawnDungeon, setDungeonState)
	.onUpdate(movePlayer, isPlayerInside, updateCameraZoom(7), startDialogDungeon, exitDungeon, allowPlayerToExit, addTalkingIcon, enableTouchJoystick)
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
