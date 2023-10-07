import { type Dialog, DialogContainer } from '@/dungeon/NPC'
import { assets } from '@/globals/init'
import { Interactable } from '@/lib/interactions'
import { Tween } from '@/lib/tween'

export const dialogContainer = (dialog: Dialog) => {
	const move = (element: UIElement) => new Tween(100)
		.onUpdate(r => element.setStyles({ translate: `0px calc(-50% + ${r}px)` }), 16, 0)
		.onUpdate(r => element.setStyles({ opacity: r }), 0, 1)

	return <nineslice image={assets.ui.textbox} margin={4} scale={3}
		style={{ display: 'grid', gap: '0.2rem', padding: '0.2rem', maxWidth: '200px', translate: '0% -50%' }}
		components={[new DialogContainer(dialog), new Interactable()]}
		bind={move}
		worldPosition={{ x: 0, y: 8 }}
	></nineslice>
}
