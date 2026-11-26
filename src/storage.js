import { starter } from './examples.js'

const KEY = 'pylab.workspace.v1'
export function readWorkspace() {
  try {
    const item = JSON.parse(localStorage.getItem(KEY))
    if (item?.version === 1 && Array.isArray(item.files)) {
      const files = item.files.filter(f => f && typeof f.id==='string' && typeof f.name==='string' && !/[\\/]/.test(f.name) && typeof f.code==='string')
      if (files.length) return {version:1, files, requirements:typeof item.requirements==='string'?item.requirements:'', active:files.some(f=>f.id===item.active)?item.active:files[0].id}
    }
  } catch { /* Unavailable storage opens a new workspace in memory. */ }
  return {version:1, files:[{...starter,id:'main'}],active:'main',requirements:''}
}
export function writeWorkspace(workspace) {
  try { localStorage.setItem(KEY, JSON.stringify(workspace)); return true }
  catch { return false }
}
export function validName(value) {
  const base = value.trim().replace(/\.py$/i,'')
  return base && base.length<=76 && !/[<>:"/\\|?*\u0000-\u001f]/.test(base) && !/[. ]$/.test(base) && !/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(base) ? base+'.py' : null
}
export function availableName(name, files) {
  const taken = new Set(files.map(f=>f.name.toLowerCase()))
  let candidate = name, n = 2
  while (taken.has(candidate.toLowerCase())) {
    candidate = name.slice(0,-3) + '_' + n + '.py'
    n += 1
  }
  return candidate
}
