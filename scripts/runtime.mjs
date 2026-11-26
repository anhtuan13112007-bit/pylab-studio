import { mkdir, copyFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const folder = fileURLToPath(new URL('../public/runtime/', import.meta.url))
await mkdir(folder, { recursive: true })
for (const file of ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) {
  await copyFile(new URL('../node_modules/pyodide/' + file, import.meta.url), folder + '/' + file)
}
