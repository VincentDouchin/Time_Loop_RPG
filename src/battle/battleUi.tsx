import { assets } from '@/globals/init'

const containerStyles: StandardProperties = { width: 'fit-content', height: 'fit-content', margin: '3vw', display: 'grid', gap: '1vh', padding: '1vh', placeItems: 'center' }

export const spawnBattleUi = () => (
	<ui-element nineslice={[assets.ui.framebordered, 4, 4]} style={containerStyles}>
		<ui-element nineslice={[assets.ui.label, 4, 4]} style={{ display: 'flex', gap: '1vw' }}>
			<ui-element image={[assets.heroIcons.paladin, 3]}></ui-element>
			<ui-element>Paladin</ui-element>
		</ui-element>
		<ui-element>
			<ui-element>HP 20/20</ui-element>
			<ui-element image={[assets.ui.hpbar, 4]}/>
		</ui-element>
		<ui-element>
			<ui-element>SP 20/20</ui-element>
			<ui-element image={[assets.ui.hpbar, 4]}/>
		</ui-element>
	</ui-element>
)
