// The editor owns the worker lifetime. Only runs of the same file with the
// same permissions share this interpreter. Each run receives a private port.
let runtime, sendPlot, installedRequirements
self.onmessage = ({data:session, ports:[control]}) => {
  self.onmessage = null
  // Tabs opened before the session protocol was introduced send a single job here.
  if (Array.isArray(session.files)) {
    runJob(session,control).finally(() => control.close())
    return
  }
  let busy = false
  control.onmessage = async ({data, ports:[port]}) => {
    if (!port) return
    if (busy || data.online !== session.online) {
      port.postMessage({type:'failure',message:'Phiên Python đã thay đổi. Hãy chạy lại.'})
      port.close()
      return
    }
    busy = true
    try {await runJob(data,port)}
    finally {busy=false;sendPlot=null;port.close()}
  }
}

async function runJob(data, port) {
  const post = message => port.postMessage(message)
  let inputReply
  setupRuntimeAssets(port, data.online, value => inputReply?.(value))
  let scope, stream = '', buffer = '', written = 0, truncated = false, lastSent = 0
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
    if (!runtime) {
      runtime = await loadPyodide({indexURL:runtimeIndex, env:{MPLBACKEND:'module://_pylab_matplotlib_backend'}})
      const sitePackages = runtime.runPython("import sysconfig; sysconfig.get_path('purelib')")
      runtime.FS.writeFile(sitePackages + '/_pylab_matplotlib_backend.py', data.plotBackend, {encoding:'utf8'})
      runtime.registerJsModule('_pylab_display', {send_png:(...args) => sendPlot?.(...args)})
    }
    sendPlot = (id, number, title, bytes) => {
      flush()
      const png = new Blob([bytes.toJs()], {type:'image/png'})
      post({type:'plot', id, number, title, png})
    }
    for (const [setter, kind] of [['setStdout','out'],['setStderr','err']]) {
      const decoder = new TextDecoder()
      runtime[setter]({write(bytes){append(kind,decoder.decode(bytes,{stream:true}));return bytes.length}})
    }
    const folder = '/home/pyodide'
    const fs = runtime.FS
    fs.chdir('/')
    for (const path of [folder,'/tmp']) fs.mount(fs.filesystems.MEMFS,{},path)
    fs.chdir(folder)
    for (const file of data.files) {
      if (file.name.endsWith('.py') && !/[\\/]/.test(file.name)) {
        runtime.FS.writeFile(folder + '/' + file.name, file.code, {encoding:'utf8'})
      }
    }
    const requirements = data.requirements
    if (installedRequirements === requirements) data.requirements = ''
    const issues = await loadWorkspacePackages(runtime, data, post)
    installedRequirements = requirements
    scope = runtime.toPy({})
    scope.set('_package_issues', JSON.stringify(issues))
    scope.set('_echo', text => append('input', text))
    scope.set('_next_input', () => {
      flush()
      return new Promise(resolve => {
        inputReply = value => {inputReply=null;resolve(value === null ? '' : value+'\n')}
        post({type:'stdin'})
      })
    })
    scope.set('_interactive',Boolean(data.interactive))
    scope.set('_source',data.code)
    scope.set('_filename',data.name)
    scope.set('_stdin',data.stdin)
    post({type:'running'})
    const execTime = performance.now()
    const ok = await runtime.runPythonAsync(`
import ast, asyncio, inspect, io, json, sys, traceback, linecache, os
_loop = asyncio.get_event_loop()
_initial_tasks = asyncio.all_tasks(_loop)
_streams = sys.stdin, sys.stdout, sys.stderr
_path, _argv = sys.path[:], sys.argv[:]
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
sys.stdin, sys.stdout, sys.stderr = _streams
sys.path, sys.argv = _path, _argv
os.chdir('/home/pyodide')
_workspace_modules = []
for _name, _module_obj in list(sys.modules.items()):
    if not isinstance(_module_obj, type(sys)):
        continue
    _attrs = vars(_module_obj)
    _locations = [_attrs.get('__file__')]
    if _attrs.get('__file__') is None and _attrs.get('__path__') is not None:
        _locations.extend(_attrs['__path__'])
    if any(isinstance(p, str) and os.path.abspath(p).startswith(('/home/pyodide/', '/tmp/')) for p in _locations):
        _workspace_modules.append(_name)
for _name in _workspace_modules:
    sys.modules.pop(_name, None)
for _dir in list(sys.path_importer_cache):
    if _dir == os.getcwd() or _dir.startswith(('/home/pyodide/', '/tmp/')):
        sys.path_importer_cache.pop(_dir, None)
linecache.clearcache()
if 'matplotlib.pyplot' in sys.modules:
    sys.modules['matplotlib.pyplot'].close('all')
_reusable = not _loop.is_closed() and not (asyncio.all_tasks(_loop) - _initial_tasks)
_ok
`, {globals:scope})
    fs.chdir('/')
    for (const path of ['/tmp',folder]) fs.unmount(path)
    fs.chdir(folder)
    flush()
    post({type:'done',ok,reusable:scope.get('_reusable'),ms:performance.now()-execTime})
  } catch (err) {
    flush()
    post({type:'failure',message: String(err.message || err),ms:performance.now()-start})
  } finally {scope?.destroy()}
}
