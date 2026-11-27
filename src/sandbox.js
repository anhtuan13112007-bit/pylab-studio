// The editor supplies only named public runtime assets and the files selected for this run.
const core = ['pyodide.asm.wasm', 'python_stdlib.zip', 'pyodide-lock.json']
const local = path => new URL(path, document.baseURI)
const cdn = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/'
let setup

async function readAsset(path) {
  const response = await fetch(local(path), {credentials:'omit', redirect:'error', referrerPolicy:'no-referrer'})
  if (!response.ok) throw Error('Không đọc được thành phần PyLab: ' + path)
  return response.text()
}
async function loadSetup() {
  const [scripts, catalog, lock, scanner, installer] = await Promise.all([
    Promise.all(['runtime/pyodide.js','runtime/pyodide.asm.js','package-loader.js','runner.js'].map(readAsset)),
    readAsset('runtime/package-sources.json').then(JSON.parse),
    readAsset('runtime/pyodide-lock.json').then(JSON.parse),
    readAsset('workspace-imports.py'), readAsset('install-packages.py')
  ])
  const assets = new Map(core.map(name => [name, {url:local('runtime/' + name)}]))
  const remote = new Set(catalog.remoteFiles)
  for (const [name, entry] of Object.entries(lock.packages)) {
    if (name.endsWith('-tests')) continue
    const file = entry.file_name
    const online = remote.has(file)
    const digest = entry.sha256.match(/../g).map(pair => parseInt(pair,16))
    assets.set(file, {url:new URL(file, online ? cdn : local('runtime/')), online,
                       integrity:'sha256-' + btoa(String.fromCharCode(...digest))})
  }
  return {source:scripts.join('\n;\n'), assets, imports:catalog.imports, scanner, installer}
}
export function startSandbox(job, onMessage, onError) {
  const frame = document.createElement('iframe')
  frame.hidden = true
  frame.setAttribute('sandbox','allow-scripts')
  frame.referrerPolicy = 'no-referrer'
  frame.src = local('sandbox.html')
  const {port1, port2} = new MessageChannel()
  const errors = new MessageChannel()
  errors.port1.onmessage = () => onError('Không khởi động được Python trong vùng cách ly.')
  const abort = new AbortController()
  let budget = 300000, runningSince = null, executionTimer
  function resume() {
    if (runningSince !== null) return
    runningSince = performance.now()
    executionTimer = setTimeout(() => onError('Đã dừng sau 5 phút chạy. Hãy chia bài thành các phần nhỏ hơn.'),budget)
  }
  function pause() {
    if (runningSince === null) return
    budget -= performance.now() - runningSince
    clearTimeout(executionTimer)
    runningSince = null
  }
  const timer = setTimeout(() => onError('Hết thời gian khởi động bộ chạy.'), 90000)
  let sent = 0
  const served = new Set()
  async function start() {
    if (!setup) setup = loadSetup().catch(err => {setup=null;throw err})
    const {source, assets, imports, scanner, installer} = await setup
    if (abort.signal.aborted) return
    port1.onmessage = async ({data}) => {
      if (!data || abort.signal.aborted) return
      if (data.type !== 'asset') {
        if (data.type === 'running') {clearTimeout(timer);resume()}
        if (data.type === 'stdin' && job.interactive) pause()
        onMessage(data)
        return
      }
      const asset = assets.get(data.name)
      try {
        if (!asset || (asset.online && !job.online) || served.has(data.name) || served.size >= 128) {
          throw Error('Tài nguyên chưa được cho phép. Kiểm tra mục Gói và tệp.')
        }
        served.add(data.name)
        const response = await fetch(asset.url, {integrity:asset.integrity || '', signal:abort.signal,
          credentials:'omit', redirect:'error', referrerPolicy:'no-referrer'})
        if (!response.ok) throw Error('Không tải được gói đã chọn.')
        const bytes = await response.arrayBuffer()
        sent += bytes.byteLength
        if (sent > 256 * 1024 * 1024) throw Error('Gói vượt dung lượng cho phép cho một lần chạy.')
        port1.postMessage({type:'asset',name:data.name,bytes},[bytes])
      } catch (error) {
        if (!abort.signal.aborted) port1.postMessage({type:'asset',name:data.name,error:error.message})
      }
    }
    frame.contentWindow.postMessage({source, job:{...job, imports, scanner, installer}}, '*', [port2,errors.port2])
  }
  frame.onload = () => start().catch(error => {if (!abort.signal.aborted) onError(error.message)})
  frame.onerror = () => onError('Không mở được vùng chạy Python.')
  document.body.append(frame)
  return {
    answer(value) {resume();port1.postMessage({type:'stdin',value})},
    terminate() {
      clearTimeout(timer);clearTimeout(executionTimer);abort.abort();port1.close();port2.close()
      errors.port1.close();errors.port2.close();frame.remove()
    }
  }
}
