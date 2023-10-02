interface contextData {
startup: boolean
controls: 'touch' | 'keyboard' | 'gamepad'
}

export const context: contextData = {
	startup: true,
	controls: 'keyboard',

}
