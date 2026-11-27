import './style.css'
import plotBackend from './matplotlib-backend.py?raw'
import { displayPlot, clearPlots } from './plots.js'
import './editor-colors.css'
import { createEditor } from './editor.js'
import { starter, examples } from './examples.js'
import { readWorkspace, writeWorkspace, validName, availableName } from './storage.js'
import { icon, renderIcons } from './icons.js'
import { setupAppearance } from './appearance.js'
// The notebook exporter is loaded when a notebook is requested.
import { closeInput, requestInput } from './terminal.js'
import { filesForRun, checkPackages } from './run-permissions.js'
import { startSandbox } from './sandbox.js'

const permissions = new Map()
const accessFor = id => permissions.get(id) || {sharedIds:[], online:false}

const $ = id => document.getElementById(id)
const all = selector => [...document.querySelectorAll(selector)]
const elem = (name, className, text) => {
  const el = document.createElement(name)
  if (className) el.className = className
  if (text !== undefined) el.textContent = text
  return el
}
renderIcons()
const workspace = readWorkspace()
const current = () => workspace.files.find(f=>f.id===workspace.active)
let task = null, saveTimer = 0, toastTimer = 0
let view = 'studio'
const editor = createEditor($('editor'), current().code, code => {
  current().code = code; scheduleSave()
}, (line,col) => { $('cursor').textContent = 'Dòng '+line+', cột '+col }, runOrStop)
setupAppearance(notify)

function notify(message) {
  clearTimeout(toastTimer); $('toast').textContent=message; $('toast').hidden=false
  toastTimer=setTimeout(()=>{$('toast').hidden=true},3000)
}
function savedStatus(message, symbol) {
  $('saved').replaceChildren(icon(symbol),elem('span','',message))
  $('saved').title=message
}
function persist() {
  clearTimeout(saveTimer)
  if (writeWorkspace(workspace)) savedStatus('Đã lưu trên máy','cloud-check')
  else savedStatus('Lưu thất bại · hãy tải tệp','cloud-off')
}
function scheduleSave() {
  if (!saveTimer) savedStatus('Đang lưu…','clock-3')
  clearTimeout(saveTimer); saveTimer=setTimeout(()=>{saveTimer=0;persist()},250)
}
window.addEventListener('pagehide',persist)
document.addEventListener('visibilitychange',()=>{if(document.hidden)persist()})

function setTheme(theme) {
  document.documentElement.dataset.theme=theme
  const title = theme==='dark'?'Chuyển sang giao diện sáng':'Chuyển sang giao diện tối'
  $('theme').title=title; $('theme').setAttribute('aria-label',title)
  $('theme').replaceChildren(icon(theme==='dark'?'sun':'moon'))
}
let initialTheme='light'
try { initialTheme=localStorage.getItem('pylab.theme')==='dark'?'dark':'light' } catch {}
setTheme(initialTheme)
$('theme').onclick=()=> {
  const value=document.documentElement.dataset.theme==='dark'?'light':'dark'
  setTheme(value); try {localStorage.setItem('pylab.theme',value)} catch {}
}

function closeMenu() {
  $('sidebar').classList.remove('open'); $('scrim').hidden=true; $('menu').setAttribute('aria-expanded','false')
}
$('menu').onclick=()=>{ $('sidebar').classList.add('open');$('scrim').hidden=false;$('menu').setAttribute('aria-expanded','true') }
$('scrim').onclick=closeMenu
matchMedia('(min-width:931px)').addEventListener('change',e=>{if(e.matches)closeMenu()})

function setFocusMode(on) {
  document.body.classList.toggle('focus-mode',on)
  const label = on?'Thu gọn bàn làm việc':'Mở rộng bàn làm việc'
  $('focus').title=label; $('focus').setAttribute('aria-label',label); $('focus').replaceChildren(icon(on?'minimize-2':'maximize-2'))
  editor.measure()
}
$('focus').onclick=()=>setFocusMode(!document.body.classList.contains('focus-mode'))

function route() {
  view=location.hash==='#library'?'library':'studio'
  $('studio-page').hidden=view!=='studio';$('library-page').hidden=view!=='library'
  $('crumb-page').textContent=view==='studio'?'Trình soạn thảo':'Thư viện mẫu'
  document.title=$('crumb-page').textContent+' · PyLab'
  for (const btn of all('nav [data-route]')) {
    btn.classList.toggle('selected',btn.dataset.route===view)
    if(btn.dataset.route===view)btn.setAttribute('aria-current','page');else btn.removeAttribute('aria-current')
  }
  if(view==='library')setFocusMode(false)
  closeMenu(); editor.measure(); window.scrollTo(0,0)
}
function navigate(page) { if(location.hash==='#'+page)route();else location.hash=page }
all('[data-route]').forEach(btn=>{btn.onclick=()=>navigate(btn.dataset.route)})
window.addEventListener('hashchange',route)
function showFiles() {
  $('input-mode').value=current().inputMode || (current().stdin ? 'batch':'terminal')
  const list=$('file-list');list.replaceChildren()
  for(const file of workspace.files) {
    const row=elem('div','file-row')
    const btn=elem('button','file-link'+(file.id===workspace.active?' active':''))
    btn.title=file.name;btn.append(icon('file-code-2'),elem('span','',file.name));btn.onclick=()=>openFile(file)
    if(file.id===workspace.active)btn.setAttribute('aria-current','true')
    const options=elem('button','icon small file-options');options.append(icon('ellipsis'));options.title='Quản lý '+file.name
    options.setAttribute('aria-label',options.title); options.onclick=()=>fileOptions(file)
    row.append(btn,options);list.append(row)
  }
  $('filename').textContent=current().name
}
function openFile(file) {
  if(current().id!==file.id) {
    if(task)stop()
    workspace.active=file.id;editor.open(file.code)
    $('stdin').value=file.stdin || ''; resetConsole(); persist()
  }
  showFiles(); navigate('studio');closeMenu()
}
function addFile(name,code='',stdin='',source=null) {
  const file={id:crypto.randomUUID(),name:availableName(name,workspace.files),code,stdin,source}
  workspace.files.push(file);openFile(file)
  return file
}
const modal=$('modal'), form=modal.querySelector('form')
modal.setAttribute('aria-labelledby','modal-title')
let onSubmit=null
form.addEventListener('submit',event=>{
  const action=event.submitter?.value ?? 'ok'
  if(action==='cancel')return
  event.preventDefault()
  if(onSubmit)onSubmit(action)
})
modal.addEventListener('click',e=>{if(e.target===modal)modal.close()})
function dialog(title,content,actions,handler) {
  if(modal.open)modal.close()
  $('modal-title').textContent=title;$('modal-body').replaceChildren(content)
  const buttons=actions.map(([value,label,kind])=>{
    const b=elem('button',kind,label); b.type='submit';b.value=value
    if(value==='cancel')b.formNoValidate=true
    return b
  })
  $('modal-actions').replaceChildren(...buttons);onSubmit=handler
  modal.showModal()
  const first=content.querySelector('input');if(first){first.focus();first.select()}
}
function nameDialog(file) {
  const label=elem('label','', 'Tên tệp Python')
  const input=elem('input');input.value=file?.name||availableName('bai_tap.py',workspace.files)
  input.required=true;input.maxLength=79;input.autocomplete='off';label.append(input)
  input.oninput=()=>input.setCustomValidity('')
  dialog(file?'Đổi tên tệp':'Tạo tệp mới',label,[['cancel','Hủy','secondary'],['ok',file?'Đổi tên':'Tạo tệp','primary']],()=>{
    const name=validName(input.value)
    if(!name || workspace.files.some(f=>f.id!==file?.id&&f.name.toLowerCase()===name.toLowerCase())) {
      input.setCustomValidity(name?'Tên này đã được sử dụng.':'Hãy nhập tên tệp hợp lệ, ví dụ bai_tap.py.');input.reportValidity();return
    }
    modal.close()
    if(file){file.name=name;showFiles();persist()} else {addFile(name);editor.focus()}
  })
}
function fileOptions(file) {
  dialog(file.name,elem('p','','Chọn thao tác cho tệp này.'),[['rename','Đổi tên','secondary'],['remove','Xóa tệp','secondary']],action=>{
    if(action==='rename'){nameDialog(file);return}
    dialog('Xóa '+file.name+'?',elem('p','','Tệp này sẽ được xóa khỏi không gian trên thiết bị. Bạn có thể tải một bản .py trước khi xóa.'),[['cancel','Giữ tệp','secondary'],['ok','Xóa tệp','primary']],()=>{
      modal.close()
      if(task)stop()
      const wasCurrent=workspace.active===file.id
      workspace.files=workspace.files.filter(f=>f.id!==file.id)
      if(!workspace.files.length)workspace.files.push({...starter,id:'main'})
      if(wasCurrent){workspace.active=workspace.files[0].id;editor.open(current().code);$('stdin').value=current().stdin||'';resetConsole()}
      showFiles();persist()
    })
  })
}
$('new-file').onclick=()=>nameDialog(null)
$('import').onclick=()=>$('file-input').click()
$('file-input').onchange=async event=>{
  const file=event.target.files[0];event.target.value=''
  if(!file)return
  if(!file.name.toLowerCase().endsWith('.py')||file.size>1024*1024){notify('Chọn tệp .py tối đa 1 MB.');return}
  try { addFile(validName(file.name)||'nhap_tep.py',(await file.text()).replace(/^\uFEFF/,''));notify('Đã nhập tệp Python.') }
  catch { notify('Chưa đọc được tệp. Hãy thử chọn lại.') }
}
function download() {
  const url=URL.createObjectURL(new Blob([current().code],{type:'text/x-python;charset=utf-8'}))
  const link=elem('a');link.href=url;link.download=current().name;document.body.append(link);link.click();link.remove()
  setTimeout(()=>URL.revokeObjectURL(url),2000)
}
$('download').onclick=download
function openExample(sample) {
  const saved=workspace.files.find(f=>f.source===sample.id)
  if(saved){openFile(saved);notify('Đã mở bản đang lưu của bạn.')}
  else addFile(sample.file,sample.code,sample.stdin||'',sample.id)
}
function card(s) {
  const button=elem('button','example-card'), art=elem('span','sample-icon '+s.color)
  art.append(icon(s.icon));const text=elem('span','card-text')
  text.append(elem('strong','',s.name),elem('small','',s.description))
  button.append(art,elem('span','topic',s.topic),text)
  button.onclick=()=>openExample(s)
  return button
}
$('quick-list').append(...examples.slice(0,3).map(card))
for(const topic of new Set(examples.map(s=>s.topic)))$('category').append(new Option(topic,topic))
const normalize=text=>text.toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replaceAll('đ','d')
function showLibrary() {
  const q=normalize($('search').value.trim()),topic=$('category').value
  const results=examples.filter(s=>(!topic||topic===s.topic)&&normalize([s.name,s.description,s.topic,s.file].join(' ')).includes(q))
  $('library-list').replaceChildren(...results.map(card));$('no-results').hidden=results.length>0
}
$('search').oninput=showLibrary;$('category').onchange=showLibrary;showLibrary()

function tab(input) {
  $('out-panel').hidden=input;$('in-panel').hidden=!input
  for(const [id,active] of [['output-tab',!input],['stdin-tab',input]]) {
    $(id).classList.toggle('active',active);$(id).setAttribute('aria-selected',String(active))
    $(id).tabIndex=active?0:-1
  }
  $('clear').hidden=input
}
$('stdin-tab').onclick=()=>tab(true);$('output-tab').onclick=()=>tab(false)
for(const id of ['output-tab','stdin-tab']) $(id).onkeydown=e=>{
  if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){
    e.preventDefault();const input=e.key==='End'||(e.key!=='Home'&&id==='output-tab');tab(input);$(input?'stdin-tab':'output-tab').focus()
  }
}
$('input-mode').onchange=()=>{current().inputMode=$('input-mode').value;scheduleSave()}
$('stdin').oninput=()=>{current().stdin=$('stdin').value;current().inputMode='batch';$('input-mode').value='batch';scheduleSave()}
function status(text,type='') { $('run-state').replaceChildren(elem('span','dot '+type),document.createTextNode(text)) }
function resetConsole() {
  clearPlots();$('output').replaceChildren();$('command').textContent='';$('elapsed').textContent='';tab(false);status('Sẵn sàng')
}
$('clear').onclick=()=>{ clearPlots();$('output').replaceChildren();$('command').textContent='';if(!task){$('elapsed').textContent='';status('Đã xóa kết quả')} }
function runButton(busy) {
  $('run').classList.toggle('running',busy)
  const mac=/Mac|iPhone|iPad/.test(navigator.platform)
  $('run').replaceChildren(icon(busy?'square':'play'),elem('span','',busy?'Dừng':'Chạy mã'),elem('kbd','',mac?'⌘ B':'Ctrl B'))
}
function finish() { if(task)task.terminate();task=null;closeInput();runButton(false) }
function stop() { finish();status('Đã dừng');$('elapsed').textContent='' }
function appendOutput(text,isError=false,isInput=false) {
  const box=$('out-panel'),follow=box.scrollHeight-box.scrollTop-box.clientHeight<36
  const span=elem('span',isError?'stderr':isInput?'echo':'',text);$('output').append(span)
  if(follow)box.scrollTop=box.scrollHeight
}
async function runOrStop() {
  if(task){stop();return}
  resetConsole();$('command').textContent='$ python '+current().name;status('Đang nạp Python…','busy');runButton(true)
  try {
    const entry = current()
    const access = accessFor(entry.id)
    const interactive = $('input-mode').value==='terminal'
    const job = {
      files:filesForRun(workspace.files,entry,access.sharedIds), name:entry.name, code:entry.code,
      interactive, stdin:interactive ? '' : entry.stdin || '', plotBackend,
      online:access.online, requirements:access.online ? checkPackages(access.requirements).join('\n') : ''
    }
    let characters=0, events=0, images=0, imageBytes=0
    const fail = message => {
      if (task !== worker) return
      finish();status('Lỗi bộ chạy','error');appendOutput(String(message).slice(0,1600),true)
    }
    const worker=startSandbox(job, data=>{
      if(task!==worker)return
      if (++events > 10000) {fail('Đã dừng sau quá nhiều thông báo.');return}
      if(data.type==='packages' && typeof data.name==='string')status('Đang nạp '+data.name.slice(0,180)+'…','busy')
      if(data.type==='stdin' && job.interactive) {
        tab(false);status('Chờ nhập dữ liệu…','busy')
        requestInput(value=>{worker.answer(value);status('Đang chạy…','busy')})
      }
      if(data.type==='running')status('Đang chạy…','busy')
      if(data.type==='text' && typeof data.text==='string' && characters<65580) {
        const part=data.text.slice(0,65580-characters)
        characters+=part.length;appendOutput(part,data.stream==='err',data.stream==='input')
      }
      if(data.type==='plot') {
        if (!(data.png instanceof Blob) || data.png.type!=='image/png' || typeof data.title!=='string'
          || !Number.isSafeInteger(data.id) || !Number.isSafeInteger(data.number)) return
        imageBytes+=data.png.size
        if (++images>48 || data.png.size>8*1024*1024 || imageBytes>32*1024*1024) {
          fail('Đã dừng sau khi đạt giới hạn ảnh của lần chạy.');return
        }
        displayPlot({...data,title:data.title.slice(0,240)},$('output'),$('out-panel'))
      }
      if(data.type==='done' && Number.isFinite(data.ms) && typeof data.ok==='boolean'){
        finish();status(data.ok?'Hoàn tất':'Có lỗi',data.ok?'':'error')
        $('elapsed').textContent=new Intl.NumberFormat('vi-VN',{maximumFractionDigits:2}).format(data.ms/1000)+' s'
      }
      if(data.type==='failure' && typeof data.message==='string')fail(data.message)
    }, fail)
    task=worker
  } catch(err){finish();status('Lỗi bộ chạy','error');appendOutput(err.message,true)}
}
$('run').onclick=runOrStop
$('packages').onclick=()=>{
  const body=elem('div','package-settings')
  const entry = current()
  const access = accessFor(entry.id)
  const choices = []
  const toggle = (text,checked) => {
    const label=elem('label','permission-choice')
    const box=elem('input');box.type='checkbox';box.checked=checked
    label.append(box,document.createTextNode(text));body.append(label)
    return box
  }
  body.append(elem('p','','Mỗi lần chạy và xuất notebook chỉ dùng '+entry.name+' cùng các tệp bạn chọn dưới đây.'))
  for(const file of workspace.files.filter(file=>file.id!==entry.id)) {
    choices.push([file.id,toggle(file.name,access.sharedIds.includes(file.id))])
  }
  const online=toggle('Cho phép bài này tải gói qua Internet trong phiên này',access.online)
  body.append(elem('p','','Mặc định dùng gói đi kèm. Khi bật mạng, mã và thư viện trong bài có thể kết nối tới PyPI và kho tệp PyPI. PyLab tải các gói Pyodide đã khóa từ jsDelivr.'))
  const label=elem('label','','Gói PyPI cho phép cài · mỗi dòng một gói')
  const input=elem('textarea')
  input.value=access.requirements ?? workspace.requirements;input.spellcheck=false;input.placeholder='python-slugify\nhumanize==4.12.3'
  input.oninput=()=>input.setCustomValidity('')
  label.append(input);body.append(label)
  dialog('Gói và tệp của '+entry.name,body,[['export','Xuất notebook','secondary'],['ok','Lưu','primary']],async action=>{
    try {checkPackages(input.value)} catch(error){input.setCustomValidity(error.message);input.reportValidity();return}
    const sharedIds=choices.filter(([,box])=>box.checked).map(([id])=>id)
    if(action==='export'){
      try {const {exportNotebook}=await import('./notebook.js');await exportNotebook(filesForRun(workspace.files,entry,sharedIds),entry,input.value);notify('Đã xuất notebook với các tệp đã chọn.')}
      catch(error){notify(error.message)}
      return
    }
    permissions.set(entry.id,{sharedIds,online:online.checked,requirements:input.value.trim()})
    workspace.requirements=input.value.trim();persist();modal.close();notify('Đã lưu quyền chạy cho tệp này trong phiên hiện tại.')
  })
}
$('help').onclick=()=>{
  closeMenu()
  const list=elem('dl')
  for(const [title,text] of [
    ['Chạy chương trình','Dùng Ctrl+B hoặc Ctrl+Enter để chạy hoặc dừng (⌘ trên Mac). Ctrl+S tải tệp .py.'],
    ['Nhập dữ liệu','Khi input() chờ, gõ trong Terminal rồi nhấn Enter. Ctrl+D hoặc EOF kết thúc đầu vào. Trong thẻ Đầu vào có thể chọn dùng các dòng soạn sẵn.'],
    ['Làm việc với nhiều tệp','Dấu + tạo tệp mới. Trong tệp chính, chọn mô-đun cần dùng ở Gói và tệp rồi dùng import. Nút ⋯ bên cạnh tệp cho phép đổi tên và xóa.'],
    ['Giữ bài làm','Web tự lưu theo trình duyệt. Bấm biểu tượng tải xuống hoặc Ctrl + S để lấy tệp .py. Xóa dữ liệu trình duyệt cũng xóa bài đã lưu.'],
    ['Di chuyển bằng bàn phím','Trong vùng mã, Tab thụt lề. Bấm Esc rồi Tab để chuyển đến điều khiển kế tiếp.']
  ])list.append(elem('dt','',title),elem('dd','',text))
  dialog('Hướng dẫn sử dụng',list,[['cancel','Đã hiểu','primary']],null)
}
document.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]'))return
  if(view==='studio' && e.shiftKey && e.key==='F5'){e.preventDefault();if(task)stop();return}
  if(e.key==='Escape'){closeMenu();if(document.body.classList.contains('focus-mode'))setFocusMode(false)}
  if(view!=='studio'||(!e.ctrlKey&&!e.metaKey)||e.defaultPrevented)return
  if(e.key==='Enter'||e.key.toLowerCase()==='b'){e.preventDefault();if(!e.repeat)runOrStop()}
  if(e.key.toLowerCase()==='s'){e.preventDefault();persist();download()}
})
showFiles();$('stdin').value=current().stdin||'';tab(false);route();runButton(false)
persist()
// Only the shipped starter is run automatically. Returning work stays editable until Run.
if(view==='studio' && current().id==='main' && current().code===starter.code && workspace.files.length===1 && !workspace.requirements.trim())runOrStop()
