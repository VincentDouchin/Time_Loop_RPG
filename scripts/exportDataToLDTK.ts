import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { battles } from './../src/constants/battles'

const enums = { battles: Object.keys(battles) }
writeFile(path.join(process.cwd(), 'src', 'constants', 'exports', 'LDTKEnums.json'), JSON.stringify(enums))
