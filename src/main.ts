import { OrthographicCamera } from 'three'
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
import { battleState, despawnEntities, dungeonState, ecs, overworldState, startGame } from './globals/init'
import { animateSprites } from './lib/animation'
import { adjustScreenSize, cameraFollow, initializeCameraBounds, render, spawnCamera, updateCameraZoom } from './lib/camera'
import { changeControls, disableTouchJoystick, enableTouchJoystick, registerInput } from './lib/inputs'
import { detectInteractions, triggerOnClick, updateMousePosition } from './lib/interactions'
import { initThree } from './lib/rendering'
import { Sprite } from './lib/sprite'
import { time } from './lib/time'
import { sortSprites, stepWorld, updatePosition, updateSpritePosition } from './lib/transforms'
import { Tween } from './lib/tween'
import { MenuInputMap, clickOnMenuInput, spawnMenuInputs } from './menus/menuInputs'
import { save, saveToLocalStorage } from './save/saveData'
import { ApocalypseShader, updateApocalypseShader } from './shaders/ApocalypseShader'
import { ColorShader } from './shaders/ColorShader'
import { ItemPickupShader } from './shaders/ItemPickupShader'
import { OutlineShader, addOutlineShader } from './shaders/OutlineShader'
import { battleDialog } from './states/battle/battleCutscene'
import { banditCutscene } from './states/battle/cutscene'
import { savePlayerHealth } from './states/battle/health'
import { despawnBattle, spawnBattle } from './states/battle/spawnBattleBackground'
import { battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose } from './states/battle/spawnBattlers'
import { addTalkingIcon, startDialogDungeon } from './states/dungeon/NPC'
import { Dungeon } from './states/dungeon/dungeonComponents'
import { hideThanks, showEndOfDemo } from './states/dungeon/endOfDemo'
import { PlayerInputMap } from './states/dungeon/playerInputs'
import { movePlayer } from './states/dungeon/playerMovement'
import { allowPlayerToExit, exitDungeon, isPlayerInside, setDungeonState, spawnDungeon } from './states/dungeon/spawnDungeon'
import { Inventory, openInventory, spawnInventoryToggle, updateCoinUi } from './states/overworld/InventoryUi'
import { triggerApocalypse } from './states/overworld/apocalypse'
import { addNavigationArrows, moveOverworldCharacter, pickupOverworldTreasure, removeNavigationMenu } from './states/overworld/navigation'
import { spawnStepsUi } from './states/overworld/overworldUi.tsx'
import { setInitialState } from './states/overworld/setInitialState'
import { despawnOverworld, setOverwolrdState, spawnOverworld } from './states/overworld/spawnOverworld'
import { StartGameUI, spawnStartUi } from './states/startGame/startui'
import { addUIElementsToDOM, spawnUIRoot } from './ui/UI'
import { BattleUI, OverWorldUI, setDefaultFontSize } from './ui/UiElement'
import { selectEntities, unSelectDespawnMenus, updateMenus } from './ui/menu'
import { addNineSlicetoUI } from './ui/nineSliceUi'
import { addToScene, addToWorld, registerFullScreenShader, registerShader } from './utils/registerComponents'
import { updatePlayerUi } from './states/battle/battleUi'
import { runif } from './lib/ECS.ts'

// !Lib

ecs
	.core.onEnter(initThree, updateMousePosition, spawnCamera, spawnMenuInputs, spawnUIRoot, setDefaultFontSize, changeControls)
	.onPreUpdate(detectInteractions, updatePosition, clickOnMenuInput)
	.onUpdate(updateMenus, addOutlineShader, animateSprites, addNineSlicetoUI, addUIElementsToDOM, selectEntities, unSelectDespawnMenus, () => Tween.update(time.delta), adjustScreenSize(), initializeCameraBounds, registerShader(ColorShader, OutlineShader, ItemPickupShader), registerFullScreenShader(ApocalypseShader), addToWorld, updateApocalypseShader, triggerOnClick, sortSprites)
	.onPostUpdate(updateSpritePosition, cameraFollow, render, stepWorld)
	.enable()

// !Plugins
ecs.addPlugin(addToScene(OrthographicCamera, Sprite, CSS2DObject))
	.addPlugin(registerInput(MenuInputMap, PlayerInputMap))

// ! Start Game
startGame
	.onEnter(spawnStartUi, spawnOverworld(false))
	.onUpdate()
	.onExit(despawnEntities(StartGameUI), setInitialState, despawnOverworld)
	.enable()

// ! States
overworldState
	.onEnter(showEndOfDemo, spawnOverworld(), runif(() => !save.finishedDemo, spawnStepsUi), setOverwolrdState, spawnInventoryToggle)
	.onUpdate(moveOverworldCharacter, runif(() => !save.finishedDemo, triggerApocalypse), addNavigationArrows, removeNavigationMenu, pickupOverworldTreasure, openInventory, hideThanks, updateCoinUi)
	.onExit(despawnOverworld, despawnEntities(OverWorldUI, Inventory))

battleState
	.onEnter(spawnBattle)
	.onUpdate(battleTurn, outlineSelectedEnemy, removeDeadBattlers, winOrLose, savePlayerHealth, battleDialog, banditCutscene, updatePlayerUi)
	.onExit(despawnBattle, saveToLocalStorage, despawnEntities(BattleUI))

dungeonState
	.onEnter(spawnDungeon, setDungeonState, spawnInventoryToggle)
	.onUpdate(movePlayer, isPlayerInside, updateCameraZoom(5), startDialogDungeon, exitDungeon, allowPlayerToExit, addTalkingIcon, enableTouchJoystick, openInventory, updateCoinUi)
	.onExit(disableTouchJoystick, despawnEntities(Dungeon))

// ! Game loop
const animate = async (delta: number) => {
	time.tick(delta)
	ecs.update()
	requestAnimationFrame(animate)
}

animate(performance.now())
