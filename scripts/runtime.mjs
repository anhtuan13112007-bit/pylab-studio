import { createHash } from 'node:crypto'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'

const destination = new URL('../public/runtime/', import.meta.url)
const built = new URL('../docs/runtime/', import.meta.url)
const upstream = new URL('../node_modules/pyodide/', import.meta.url)
await mkdir(destination, { recursive: true })
for (const file of ['pyodide.js', 'pyodide.asm.js', 'pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']) {
  await copyFile(new URL(file, upstream), new URL(file, destination))
}

const lock = JSON.parse(await readFile(new URL('pyodide-lock.json', upstream), 'utf8'))
const bundled = new Set()
function include(name) {
  if (bundled.has(name)) return
  bundled.add(name)
  for (const dependency of lock.packages[name].depends) include(dependency)
}
for (const name of ['sympy', 'numpy']) include(name)

function matches(bytes, entry) {
  return createHash('sha256').update(bytes).digest('hex') === entry.sha256
}

async function cached(directory, entry) {
  try {
    const bytes = await readFile(new URL(entry.file_name, directory))
    return matches(bytes, entry) ? bytes : null
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

async function prepareWheel(name) {
  const entry = lock.packages[name]
  if (await cached(destination, entry)) return
  let bytes = await cached(built, entry)
  if (!bytes) {
    const url = 'https://cdn.jsdelivr.net/pyodide/v' + lock.info.version + '/full/' + entry.file_name
    const response = await fetch(url, { signal: AbortSignal.timeout(120000) })
    if (!response.ok) throw new Error('Cannot download ' + entry.file_name + ': HTTP ' + response.status)
    bytes = Buffer.from(await response.arrayBuffer())
    if (!matches(bytes, entry)) throw new Error('SHA-256 mismatch for ' + entry.file_name)
  }
  await writeFile(new URL(entry.file_name, destination), bytes)
}
await Promise.all([...bundled].map(prepareWheel))
const imports = {}
for (const name of bundled) {
  for (const module of lock.packages[name].imports) imports[module] = name
}
await writeFile(new URL('bundled-imports.json', destination), JSON.stringify(imports) + '\n')
