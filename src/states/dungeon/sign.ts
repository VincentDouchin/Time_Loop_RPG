import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier2d-compat'
import { Group } from 'three'
import { Dialog } from './dialog'
import { SignPost } from './dungeonComponents'
import type { Class } from '@/lib/ECS'
import type { EntityInstance, LayerInstance } from '@/level/LDTK'
import { dialog } from '@/constants/dialogs'

export const SignBundle = (sign: EntityInstance, layerInstance: LayerInstance) => {
	const signPost = new SignPost(sign)
	const components: InstanceType<Class>[] = [
		signPost,
		signPost.position(layerInstance),
		RigidBodyDesc.fixed(),
		ColliderDesc.cuboid(4, 4),
		new Group(),
	]
	const signDialog = dialog[`sign${signPost.data.dialog}`]
	if (signDialog) {
		components.push(...new Dialog(signDialog).withMenu())
	}
	return components
}