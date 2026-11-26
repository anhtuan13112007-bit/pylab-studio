// Each run has its own worker and Python environment. Terminating the worker
// also stops native WebAssembly code and tight Python loops.
importScripts('./package-loader.js?v=3')

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
    runtime = await loadPyodide({indexURL, env:{MPLBACKEND:'module://_pylab_matplotlib_backend'}})
    const sitePackages = runtime.runPython("import sysconfig; sysconfig.get_path('purelib')")
    runtime.FS.writeFile(sitePackages + '/_pylab_matplotlib_backend.py', data.plotBackend, {encoding:'utf8'})
    runtime.registerJsModule('_pylab_display', {
      send_png(id, number, title, bytes) {
        flush()
        const png = new Blob([bytes.toJs()], {type:'image/png'})
        self.postMessage({type:'plot', id, number, title, png})
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
    const issues = await loadWorkspacePackages(runtime, data.name, data.requirements || '', indexURL)
    runtime.globals.set('_package_issues', JSON.stringify(issues))
    runtime.globals.set('_echo', text => append('input', text))
    let seq = 0, eof = false
    if (data.interactive) {
      runtime.setStdin({isatty:true, stdin() {
        if (eof) return null
        flush()
        if (!data.owner) throw new Error('Terminal cần Service Worker. Hãy dùng thẻ Đầu vào hoặc mở PyLab trong trình duyệt qua HTTPS/localhost.')
        const request = JSON.stringify({owner:data.owner,token:data.token,seq:++seq})
        while (true) {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', new URL('__terminal_input__', self.location.href), false)
          xhr.send(request)
          if (xhr.status !== 200) throw new Error('Mất kết nối nhập liệu. Hãy tải lại trang hoặc dùng thẻ Đầu vào.')
          const value = JSON.parse(xhr.responseText)
          if (value.pending) continue
          if (value.closed || value.eof) { eof=true; return null }
          append('input',value.line+'\n');flush()
          return value.line+'\n'
        }
      }})
    }
    runtime.globals.set('_interactive',Boolean(data.interactive))
    runtime.globals.set('_source',data.code)
    runtime.globals.set('_filename',data.name)
    runtime.globals.set('_stdin',data.stdin)
    self.postMessage({type:'running'})
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

if not _interactive:
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
        print("Mở Gói Python để chọn tên gói trên PyPI hoặc xuất notebook chạy bằng CPython.", file=sys.stderr)
    if isinstance(_exc, EOFError):
        print("Đã kết thúc luồng nhập. Bạn có thể chạy lại hoặc bổ sung dữ liệu ở thẻ Đầu vào.", file=sys.stderr)
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
