import { validName } from './storage.js'

export function filesForRun(files, entry, sharedIds = []) {
  const chosen = new Set(sharedIds)
  if (!files.includes(entry) || new Set(files.map(file=>file.id)).size !== files.length) {
    throw Error('Không xác định được tệp của bài. Hãy tải bản sao .py của các tệp cần dùng.')
  }
  const selected = files.filter(file => file === entry || chosen.has(file.id))
  const names = new Set()
  for (const file of selected) {
    const name = file.name.toLowerCase()
    if (validName(file.name) !== file.name || names.has(name)) {
      throw Error('Hãy đổi tên tệp Python bị trùng hoặc không hợp lệ trước khi chạy.')
    }
    names.add(name)
  }
  return selected.map(({name, code}) => ({name, code}))
}

export function checkPackages(text) {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'))
  const spec = /^[A-Za-z0-9](?:[A-Za-z0-9._-]*[A-Za-z0-9])?(?:==[A-Za-z0-9]+(?:[._+!-][A-Za-z0-9]+)*)?$/
  if (text.length > 4096 || lines.length > 32 || lines.some(line => line.length > 160 || !spec.test(line))) {
    throw Error('Mỗi dòng cần là tên gói hoặc tên==phiên_bản, tối đa 32 gói.')
  }
  return lines
}
