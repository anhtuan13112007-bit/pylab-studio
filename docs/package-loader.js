// Only entries from the Pyodide release lock can be requested through the editor.
const runtimeIndex = 'https://runtime.invalid/'
const nativeFetch = self.fetch.bind(self)
function setupRuntimeAssets(port, online, readInput) {
  const waiting = new Map()
  port.onmessage = ({data}) => {
    if (data.type === 'stdin') {readInput(data.value);return}
    const pending = waiting.get(data.name)
    if (data.type !== 'asset' || !pending) return
    waiting.delete(data.name)
    if (data.error) pending.reject(Error(data.error))
    else pending.resolve(data.bytes)
  }
  self.fetch = async (input, options) => {
    const url = new URL(input instanceof Request ? input.url : input, runtimeIndex)
    if (url.origin === 'https://runtime.invalid') {
      const name = url.pathname.slice(1)
      if (!name || name.includes('/') || url.search || url.hash) throw Error('Tên tài nguyên không hợp lệ.')
      let pending = waiting.get(name)
      if (!pending) {
        let resolve, reject
        const promise = new Promise((yes,no) => {resolve=yes;reject=no})
        pending = {promise,resolve,reject}
        waiting.set(name,pending)
        port.postMessage({type:'asset',name})
      }
      const bytes = await pending.promise
      return new Response(bytes,{headers:{'Content-Type':name.endsWith('.wasm') ? 'application/wasm' : 'application/octet-stream'}})
    }
    if (!online || !['https://pypi.org','https://files.pythonhosted.org'].includes(url.origin)) {
      throw Error('Kết nối này nằm ngoài quyền của bài chạy.')
    }
    return nativeFetch(input, {...options, credentials:'omit', referrerPolicy:'no-referrer'})
  }
}
async function loadWorkspacePackages(runtime, data, post) {
  const issues = Object.create(null)
  const scope = runtime.toPy({
    entry:data.name, declarations:data.requirements, catalog_json:JSON.stringify(data.imports),
    show_progress:name => post({type:'packages',name}),
    remember_error:(name,message) => {issues[name]=message},
    load_catalog:async name => {
      await runtime.loadPackage(name,{checkIntegrity:true,messageCallback:()=>{},errorCallback:()=>{}})
      if (!Object.hasOwn(runtime.loadedPackages,name)) throw Error('Gói chưa có trong bản cục bộ hoặc chưa được phép tải.')
    }
  })
  try {
    await runtime.runPythonAsync(data.scanner + '\n' + data.installer, {globals:scope})
  } finally {scope.destroy()}
  return issues
}
