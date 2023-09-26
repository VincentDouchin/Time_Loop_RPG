import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { battles } from './../src/constants/battles'
import { items } from './../src/constants/items'
import { entries } from './../src/utils/mapFunctions'

const treasure = entries(items).reduce((acc: string[], [key, val]) => {
	return val.treasure ? [...acc, key] : acc
}, [])
const enums = { battles: Object.keys(battles), treasure }
writeFile(path.join(process.cwd(), 'src', 'constants', 'exports', 'LDTKEnums.json'), JSON.stringify(enums))
