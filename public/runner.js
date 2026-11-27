// Each run has its own worker and Python environment. Terminating the worker
// also stops native WebAssembly code and tight Python loops.

self.onmessage = async ({data, ports}) => {
  self.onmessage = null
  const port = ports[0]
  const post = message => port.postMessage(message)
  let inputReply
  setupRuntimeAssets(port, data.online, value => inputReply?.(value))
  let runtime, stream = '', buffer = '', written = 0, truncated = false, lastSent = 0
  const start = performance.now()
  function flush() {
    if (buffer) post({type:'text',stream,text:buffer})
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
    runtime = await loadPyodide({indexURL:runtimeIndex, env:{MPLBACKEND:'module://_pylab_matplotlib_backend'}})
    const sitePackages = runtime.runPython("import sysconfig; sysconfig.get_path('purelib')")
    runtime.FS.writeFile(sitePackages + '/_pylab_matplotlib_backend.py', data.plotBackend, {encoding:'utf8'})
    runtime.registerJsModule('_pylab_display', {
      send_png(id, number, title, bytes) {
        flush()
        const png = new Blob([bytes.toJs()], {type:'image/png'})
        post({type:'plot', id, number, title, png})
      }
    })
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
    const issues = await loadWorkspacePackages(runtime, data, post)
    runtime.globals.set('_package_issues', JSON.stringify(issues))
    runtime.globals.set('_echo', text => append('input', text))
    runtime.globals.set('_next_input', () => {
      flush()
      return new Promise(resolve => {
        inputReply = value => {inputReply=null;resolve(value === null ? '' : value+'\n')}
        post({type:'stdin'})
      })
    })
    runtime.globals.set('_interactive',Boolean(data.interactive))
    runtime.globals.set('_source',data.code)
    runtime.globals.set('_filename',data.name)
    runtime.globals.set('_stdin',data.stdin)
    post({type:'running'})
    const execTime = performance.now()
    const ok = await runtime.runPythonAsync(`
import ast, inspect, io, json, sys, traceback, linecache, os
class _TerminalInput(io.StringIO):
    def readline(self, *args):
        line = super().readline(*args)
        if line:
            sys.stdout.flush()
            _echo(line if line.endswith(chr(10)) else line + chr(10))
        return line

if _interactive:
    from pyodide.ffi import can_run_sync, run_sync
    class _LiveInput(io.TextIOBase):
        def readable(self):
            return True

        def isatty(self):
            return True

        _remaining = ""
        _ended = False

        def readline(self, size=-1):
            if size == 0 or self._ended:
                return ""
            if self._remaining:
                line = self._remaining
            else:
                line = self._line_from_terminal()
            if size < 0:
                self._remaining = ""
                return line
            self._remaining = line[size:]
            return line[:size]

        def read(self, size=-1):
            chunks = []
            while size != 0:
                line = self.readline(size)
                if not line:
                    break
                chunks.append(line)
                if size > 0:
                    size -= len(line)
            return "".join(chunks)

        def _line_from_terminal(self):
            if not can_run_sync():
                raise RuntimeError("Trình duyệt chưa hỗ trợ nhập trực tiếp trong vùng cách ly. Hãy chọn Đầu vào → Dùng các dòng nhập sẵn.")
            line = run_sync(_next_input())
            if line:
                _echo(line)
            else:
                self._ended = True
            return line

    sys.stdin = _LiveInput()
else:
    sys.stdin = _TerminalInput(_stdin)
sys.argv = [_filename]
os.chdir('/home/pyodide')
sys.path.insert(0, os.getcwd())
linecache.cache[_filename] = (len(_source), None, _source.splitlines(True), _filename)
_ok = True
try:
    _compiled = compile(_source, _filename, 'exec', flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)
    _result = eval(_compiled, {'__name__':'__main__', '__file__':_filename})
    if inspect.isawaitable(_result):
        await _result
except SystemExit as _exc:
    _ok = _exc.code is None or _exc.code == 0
    if not _ok:
        print(f"SystemExit: {_exc.code}", file=sys.stderr)
except BaseException as _exc:
    _ok = False
    traceback.print_exception(type(_exc), _exc, _exc.__traceback__.tb_next)
    if isinstance(_exc, ModuleNotFoundError):
        _module = (_exc.name or "").partition(".")[0]
        _reason = json.loads(_package_issues).get(_module)
        if _reason:
            print(_reason, file=sys.stderr)
        print("Mở Gói và tệp để chọn tên gói trên PyPI hoặc xuất notebook chạy bằng CPython.", file=sys.stderr)
    if isinstance(_exc, EOFError):
        print("Đã kết thúc luồng nhập. Bạn có thể chạy lại hoặc bổ sung dữ liệu ở thẻ Đầu vào.", file=sys.stderr)
sys.stdout.flush()
sys.stderr.flush()
_ok
`)
    flush()
    post({type:'done',ok,ms:performance.now()-execTime})
  } catch (err) {
    flush()
    post({type:'failure',message: String(err.message || err),ms:performance.now()-start})
  }
}
