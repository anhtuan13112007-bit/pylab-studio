// Only the dedicated worker sees this routing table. Requests for student code,
// PyPI metadata and the app itself continue to use their original addresses.
function routePackageArchives(indexURL, catalog) {
  const archives = new Map(catalog.remoteFiles.map(file => [
    new URL(file, indexURL).href, new URL(file, catalog.cdn).href
  ]))
  const original = self.fetch.bind(self)
  self.fetch = (input, options) => {
    const url = input instanceof Request ? input.url : new URL(input, self.location.href).href
    const target = archives.get(url)
    if (!target) return original(input, options)
    const request = new Request(input, options)
    return original(target, {
      method: 'GET', mode: 'cors', credentials: 'omit',
      integrity: request.integrity, signal: request.signal, cache: request.cache
    })
  }
}

async function requiredText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Không tải được thành phần PyLab: ' + response.status + ' ' + url)
  return response.text()
}

async function loadWorkspacePackages(runtime, filename, requirements, indexURL) {
  const [catalogText, scanner, installer] = await Promise.all([
    requiredText(new URL('package-sources.json', indexURL)),
    requiredText(new URL('workspace-imports.py', self.location.href)),
    requiredText(new URL('install-packages.py', self.location.href))
  ])
  const catalog = JSON.parse(catalogText)
  routePackageArchives(indexURL, catalog)
  const issues = Object.create(null)
  const show = names => self.postMessage({type:'packages', names:[names]})
  const scope = runtime.toPy({
    entry: filename, declarations: requirements, catalog_json: JSON.stringify(catalog.imports),
    show_progress: show, remember_error: (name, message) => { issues[name] = message },
    load_catalog: async name => {
      await runtime.loadPackage(name, {checkIntegrity:true, messageCallback:()=>{}, errorCallback:message=>console.warn(message)})
      if (!Object.hasOwn(runtime.loadedPackages, name)) throw new Error('Có thể tải lại trang và kiểm tra kết nối đến kho Pyodide.')
    }
  })
  try {
    await runtime.runPythonAsync(scanner + '\n' + installer, {globals:scope})
  } catch (error) {
    const message = String(error.message || error).trim().split('\n').at(-1)
    throw new Error(message.replace(/^ValueError: /, ''))
  } finally { scope.destroy() }
  return issues
}
