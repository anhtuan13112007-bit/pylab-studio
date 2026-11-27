import { checkPackages } from './run-permissions.js'
import { validName } from './storage.js'

// A notebook keeps the student's modules and input together for CPython kernels.
const codeCell = source => ({cell_type:'code', metadata:{}, execution_count:null, outputs:[], source})
const pythonString = text => JSON.stringify(text)

async function asset(path) {
  const response = await fetch(new URL(path, document.baseURI))
  if (!response.ok) throw new Error('Không đọc được tài nguyên xuất notebook.')
  return response.text()
}

export async function exportNotebook(files, entry, requirements) {
  if (!files.some(f => f.name===entry.name) || files.some(f => validName(f.name)!==f.name)) {
    throw Error('Tên tệp để xuất không hợp lệ.')
  }
  const declarations = checkPackages(requirements)
  const [catalog, scanner] = await Promise.all([asset('runtime/package-sources.json'), asset('workspace-imports.py')])
  const aliases = JSON.parse(catalog).imports
  const sources = Object.fromEntries(files.map(file => [file.name, file.code]))
  const setup = [
    'import json, os, sys, tempfile',
    'from pathlib import Path',
    'root = Path(tempfile.mkdtemp(prefix="pylab-"))',
    'os.chdir(root)',
    'sys.path.insert(0, str(root))',
    'entry = ' + pythonString(entry.name),
    'sources = json.loads(' + pythonString(JSON.stringify(sources)) + ')',
    'from pathlib import PureWindowsPath',
    'import re',
    'def checked_file(name):',
    '    target = root / name',
    '    reserved = re.match(r"^(con|prn|aux|nul|conin[$]|conout[$]|com[1-9¹²³]|lpt[1-9¹²³])(?:[.]|$)", name, re.I)',
    '    if not name.endswith(".py") or PureWindowsPath(name).name != name or reserved or ":" in name or target.resolve().parent != root.resolve():',
    '        raise ValueError("Tên tệp không hợp lệ.")',
    '    return target',
    'checked_file(entry)',
    'for name, source in sources.items():',
    '    checked_file(name).write_text(source, encoding="utf-8")'
  ].join('\n')
  const install = [
    scanner.trim(), '', 'import importlib.util, subprocess',
    'requirements = ' + JSON.stringify(declarations),
    'allow_pip = False  # Đổi thành True sau khi xem tên gói sẽ cài.',
    'aliases = json.loads(' + pythonString(JSON.stringify(aliases)) + ')',
    'def install(names):',
    '    if names and allow_pip:',
    '        subprocess.check_call([sys.executable, "-m", "pip", "install", "--only-binary=:all:", "--", *names])',
    'install(requirements)',
    'missing = [aliases[name] for name in workspace_imports(root, entry) if name in aliases',
    '           if name not in sys.stdlib_module_names and importlib.util.find_spec(name) is None]',
    'if not allow_pip and (requirements or missing):',
    '    print("Gói đề xuất:", ", ".join(sorted(set(requirements + missing))))',
    'install(sorted(set(missing)))'
  ].join('\n')
  const run = [
    'import ast, inspect, io, sys',
    'program_input = ' + pythonString(entry.inputMode==='terminal' ? '' : (entry.stdin || '')),
    'original_stdin, original_argv = sys.stdin, sys.argv',
    'try:',
    '    if program_input:',
    '        sys.stdin = io.StringIO(program_input)',
    '    sys.argv = [entry]',
    '    source = checked_file(entry).read_text(encoding="utf-8")',
    '    compiled = compile(source, str(root / entry), "exec", flags=ast.PyCF_ALLOW_TOP_LEVEL_AWAIT)',
    '    result = eval(compiled, {"__name__": "__main__", "__file__": str(root / entry)})',
    '    if inspect.isawaitable(result):',
    '        await result',
    'finally:',
    '    sys.stdin, sys.argv = original_stdin, original_argv'
  ].join('\n')
  const note = {nbformat:4, nbformat_minor:4,
    metadata:{kernelspec:{display_name:'Python 3',language:'python',name:'python3'}},
    cells:[{cell_type:'markdown',metadata:{},source:'# Bài thực hành PyLab\nNotebook chứa các tệp đã chọn và đầu vào của bài. Kiểm tra mã trước khi chạy trên máy hoặc Colab. Ô cài gói mặc định tắt pip. Chọn kernel CPython 3.10 trở lên với hệ điều hành và phần cứng phù hợp với thư viện.'},codeCell(setup),codeCell(install),codeCell(run)]}
  const url = URL.createObjectURL(new Blob([JSON.stringify(note,null,2)], {type:'application/x-ipynb+json'}))
  const link = document.createElement('a')
  link.href=url; link.download=entry.name.replace(/\.py$/i,'')+'.ipynb'
  document.body.append(link); link.click(); link.remove()
  setTimeout(()=>URL.revokeObjectURL(url),2000)
}
