import { readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { exec } from 'node:child_process'
import { glob } from 'glob'

const asespriteFiles = await glob('./assets/**/*.{ase,aseprite}')
for (const path of asespriteFiles) {
	const parts = path.split('\\')
	const folder = parts.at(-2)?.replace(/[ &]/g, '')
	const extension = parts.at(-1)?.split('.')[1]
	if (extension && ['aseprite', 'ase'].includes(extension)) {
		await new Promise(resolve => exec(`aseprite.exe -b "${path}" --save-as "./assets/${folder}/{slice}.png"`, resolve))
	}
}

// const files = await glob('./assets/*/*')

// const getFile = (parts: string[]) => {
// 	return parts.at(-1)?.split('.')[0]
// }
const folders: Record<string, string[]> = {}
const assetsDir = await readdir('./assets', { recursive: true, withFileTypes: true })
for (const dir of assetsDir) {
	if (dir.isDirectory()) {
		folders[dir.name] = (await readdir(`./assets/${dir.name}`)).map(x => x.split('.')[0])
	}
}
// for (const path of files) {
// 	if (path?.includes('.') && ['.d.ts', '.aseprite', '.ase'].every(ext => !path.includes(ext))) {
// 		const parts = path.split('\\')
// 		const folder = parts.at(-2)?.replace(/[ &]/g, '')
// 		const file = getFile(parts)
// 		console.log(folder, file)
// 		// folders[folder] ??= []

// 		// folders[folder].push(file)
// 	}
// }
let result = ''
for (const [folder, files] of Object.entries(folders)) {
	result += `type ${folder} = ${files.map(x => `'${x}'`).join(' | ')}\n`
}
await writeFile(path.join(process.cwd(), 'assets', 'assets.d.ts'), result)
