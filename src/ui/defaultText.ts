import { Text } from 'three-mesh-ui'

export const defaultText = (content: string, fontSize: number) => {
	return new Text({
		content, fontSize, fontFamily: './../../assets/fonts/Roboto-msdf.json', fontTexture: './../../assets/fonts/Roboto-msdf.png',
	})
}
