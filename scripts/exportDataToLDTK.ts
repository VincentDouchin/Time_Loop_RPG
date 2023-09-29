import path from 'node:path'
import process from 'node:process'

import { writeFile } from 'node:fs/promises'
import { exec } from 'node:child_process'
import LDTKEnums from './../src/constants/exports/LDTKEnums.json'

writeFile(path.join(process.cwd(), 'src', 'constants', 'exports', 'LDTKEnums.ts'), `const LDTKEnums = ${JSON.stringify(LDTKEnums)} as const
export default LDTKEnums`)
exec('npx eslint ./src/constants/exports/LDTKEnums.ts --fix')
