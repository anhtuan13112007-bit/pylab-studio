// Each run has its own worker and Python environment. Terminating the worker
// also stops native WebAssembly code and tight Python loops.
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
