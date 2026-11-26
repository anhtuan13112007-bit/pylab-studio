// Each run has its own worker and Python environment. Terminating the worker
// also stops native WebAssembly code and tight Python loops.
// Walk imports only in the entry point and the workspace modules it references.
// Parsing never executes student code. A syntax error is reported by the normal runner.
async function loadWorkspacePackages(runtime, filename, indexURL) {
  const response = await fetch(new URL('bundled-imports.json', indexURL))
  if (!response.ok) throw new Error('Không đọc được danh sách thư viện của PyLab. Hãy tải lại trang.')
  const bundled = await response.json()
  runtime.globals.set('_entry', filename)
  const imports = JSON.parse(runtime.runPython(`
from pathlib import Path
from pyodide.code import find_imports
import json

def _workspace_imports(entry):
    root = Path('/home/pyodide')
    pending = [root / entry]
    visited = set()
    external = set()
    while pending:
        file = pending.pop()
        if file in visited:
            continue
        visited.add(file)
        try:
            names = find_imports(file.read_text(encoding='utf-8'))
        except (SyntaxError, ValueError):
            continue
        for name in names:
            local = root / (name + '.py')
            if local.is_file():
                pending.append(local)
            else:
                external.add(name)
    return sorted(external)

json.dumps(_workspace_imports(_entry))
`))
  const names = [...new Set(imports.filter(name => Object.hasOwn(bundled, name)).map(name => bundled[name]))]
  if (!names.length) return
  self.postMessage({type:'packages', names})
  await runtime.loadPackage(names, {checkIntegrity:true, messageCallback:()=>{}, errorCallback:message=>console.warn(message)})
  const missing = names.filter(name => !Object.hasOwn(runtime.loadedPackages, name))
  if (missing.length) throw new Error('Không tải được thư viện ' + missing.join(', ') + '. Hãy kiểm tra kết nối tới PyLab và chạy lại.')
}

self.onmessage = async ({data}) => {
  let runtime, stream = '', buffer = '', written = 0, truncated = false, lastSent = 0
  const start = performance.now()
  function flush() {
    if (buffer) self.postMessage({type:'text',stream,text:buffer})
    buffer = ''; lastSent = performance.now()
  }
  function append(kind, text) {
    if (truncated || !text) return
    if (stream !== kind) flush()
    stream = kind
    const room = 65536-written
    buffer += text.slice(0,room); written += Math.min(room,text.length)
    if (text.length > room) { buffer += '\n[… Đã giới hạn kết quả ở 65.536 ký tự …]\n'; truncated = true }
    if (buffer.length >= 2048 || performance.now()-lastSent > 45 || truncated) flush()
  }
  try {
    const indexURL = new URL('./runtime/', self.location.href).href
    importScripts(indexURL + 'pyodide.js')
    runtime = await loadPyodide({indexURL})
    for (const [setter, kind] of [['setStdout','out'],['setStderr','err']]) {
      const decoder = new TextDecoder()
      runtime[setter]({write(bytes){append(kind,decoder.decode(bytes,{stream:true}));return bytes.length}})
    }
    const folder = '/home/pyodide'
    for (const file of data.files) {
      if (file.name.endsWith('.py') && !/[\\/]/.test(file.name)) {
        runtime.FS.writeFile(folder + '/' + file.name, file.code, {encoding:'utf8'})
      }
    }
    await loadWorkspacePackages(runtime, data.name, indexURL)
    runtime.globals.set('_echo', text => append('input', text))
    runtime.globals.set('_source',data.code)
    runtime.globals.set('_filename',data.name)
    runtime.globals.set('_stdin',data.stdin)
    self.postMessage({type:'running'})
    const execTime = performance.now()
    const ok = await runtime.runPythonAsync(`
import io, sys, traceback, linecache, os
class _TerminalInput(io.StringIO):
    def readline(self, *args):
        line = super().readline(*args)
        if line:
            sys.stdout.flush()
            _echo(line if line.endswith(chr(10)) else line + chr(10))
        return line

sys.stdin = _TerminalInput(_stdin)
sys.argv = [_filename]
os.chdir('/home/pyodide')
sys.path.insert(0, os.getcwd())
linecache.cache[_filename] = (len(_source), None, _source.splitlines(True), _filename)
_ok = True
try:
    exec(compile(_source, _filename, 'exec'), {'__name__':'__main__', '__file__':_filename})
except SystemExit as _exc:
    _ok = _exc.code is None or _exc.code == 0
    if not _ok:
        print(f"SystemExit: {_exc.code}", file=sys.stderr)
except BaseException as _exc:
    _ok = False
    traceback.print_exception(type(_exc), _exc, _exc.__traceback__.tb_next)
    if isinstance(_exc, ModuleNotFoundError):
        print("PyLab có sẵn SymPy, NumPy và mpmath. Nếu đang nhập một tệp tự viết, hãy kiểm tra tên tệp trong thanh bên.", file=sys.stderr)
    if isinstance(_exc, EOFError):
        print("Gợi ý: điền thêm dữ liệu vào thẻ Đầu vào rồi chạy lại.", file=sys.stderr)
sys.stdout.flush()
sys.stderr.flush()
_ok
`)
    flush()
    self.postMessage({type:'done',ok,ms:performance.now()-execTime})
  } catch (err) {
    flush()
    self.postMessage({type:'failure',message: String(err.message || err),ms:performance.now()-start})
  }
}
