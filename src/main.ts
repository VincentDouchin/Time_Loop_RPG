import { OrthographicCamera } from 'three'
import { spawnOverworldCharacter } from './character/spawnOverworldCharacter'
import { ecs } from './globals/init'
import { spawnOverworld } from './level/spawnOverworld'
import { animateSprites } from './lib/animation'
import { render, spawnCamera } from './lib/camera'
import { updateInputs } from './lib/inputs'
import { detectInteractions, updateMousePosition } from './lib/interactions'
import { initThree } from './lib/rendering'
import { Sprite } from './lib/sprite'
import { time } from './lib/time'
import { updateSpritePosition } from './lib/transforms'
import { ColorShader } from './shaders/ColorShader'
import { addToScene, registerShader } from './utils/registerComponents'
import { spawnMenuInputs } from './menus/menuInputs'
import { moveOverworldCharacter } from './navigation/navigation'

addToScene(OrthographicCamera, Sprite)
registerShader(Sprite)(ColorShader)
updateInputs()
ecs.core
	.onEnter(initThree, updateMousePosition, spawnCamera, spawnMenuInputs)
	.onPreUpdate(animateSprites)
	.onPostUpdate(render, updateSpritePosition, detectInteractions)
	.enable()

ecs.state
	.onEnter(spawnOverworld, spawnOverworldCharacter)
	.onUpdate(moveOverworldCharacter)
	.enable()

const animate = () => {
	ecs.update()
	time.tick(Date.now())
	requestAnimationFrame(animate)
}
animate()
