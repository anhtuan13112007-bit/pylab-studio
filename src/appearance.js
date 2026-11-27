import { drawTerrain } from './terrain.js'
import { fitPhoto } from './background-photo.js'

const defaults = {mode:'terrain',color:'#193e2b',opacity:100,page:'auto',photo:'',pagePhoto:''}
const key='pylab.appearance.v1'
const $=id=>document.getElementById(id)
const localPhoto = value => typeof value==='string' && value.length<=3*1024*1024 &&
  /^data:image\/jpeg;base64,[a-zA-Z\d+/=]+$/.test(value) ? value : ''

function read() {
  try {
    const raw=JSON.parse(localStorage.getItem(key)) || {}
    const pagePhoto=localPhoto(raw.pagePhoto)
    return {
      mode:['terrain','wave','stars','plain','image'].includes(raw.mode)?raw.mode:defaults.mode,
      color:/^#[\da-f]{6}$/i.test(raw.color)?raw.color:defaults.color,
      opacity:Number.isFinite(raw.opacity)?Math.max(0,Math.min(100,raw.opacity)):100,
      page:raw.page==='image' && pagePhoto ? 'image' : ['sky','lavender','sand'].includes(raw.page)?raw.page:'auto',
      photo:localPhoto(raw.photo), pagePhoto
    }
  } catch {return {...defaults}}
}

export function setupAppearance(notify) {
  let saved=read(), draft={...saved}
  const pending=new Map()
  const modal=$('appearance-dialog'), form=$('appearance-form')
  const save=form.querySelector('button[type=submit]')
  const banners=[$('hero'),modal.querySelector('.appearance-preview')]
  const paintings=[$('terrain'),$('preview-art')].map(canvas=>drawTerrain(canvas,()=>draft.mode))
  function apply() {
    document.documentElement.dataset.palette=draft.page
    const wallpaper=$('page-wallpaper'), preview=$('page-photo-preview')
    const visible=draft.page==='image' && Boolean(draft.pagePhoto)
    wallpaper.hidden=!visible
    wallpaper.style.backgroundImage=visible?'url("'+draft.pagePhoto+'")':'none'
    $('page-image-control').hidden=draft.page!=='image'
    $('page-photo-tools').hidden=!visible
    if(visible && preview.getAttribute('src')!==draft.pagePhoto)preview.src=draft.pagePhoto
    if(!visible)preview.removeAttribute('src')
    for(const banner of banners){
      banner.dataset.art=draft.mode
      banner.style.setProperty('--banner-color',draft.color)
      banner.style.setProperty('--art-opacity',String(draft.opacity/100))
      const photo=banner.querySelector('.hero-photo')
      photo.style.backgroundImage=(draft.mode==='image'&&draft.photo)?'url("'+draft.photo+'")':'none'
    }
    paintings.forEach(paint=>paint())
    $('opacity-value').textContent=draft.opacity+'%'
    $('image-control').hidden=draft.mode!=='image'
  }
  function sync() {
    $('art-mode').value=draft.mode;$('art-color').value=draft.color;$('art-opacity').value=draft.opacity;$('page-palette').value=draft.page
    pending.clear();save.disabled=false;$('art-file').value='';$('page-photo-file').value=''
    $('appearance-note').textContent='';apply()
  }
  $('appearance').onclick=()=>{draft={...saved};modal.showModal();sync()}
  $('appearance-close').onclick=()=>modal.close()
  modal.addEventListener('close',()=>{pending.clear();draft={...saved};apply()})
  modal.addEventListener('click',e=>{if(e.target===modal)modal.close()})
  for(const [id,prop] of [['art-mode','mode'],['art-color','color'],['art-opacity','opacity'],['page-palette','page']]){
    $(id).oninput=()=>{
      draft[prop]=prop==='opacity'?Number($(id).value):$(id).value
      if(prop==='page' || prop==='mode') {
        pending.delete(prop==='page'?'pagePhoto':'photo')
        save.disabled=pending.size>0
        $('appearance-note').textContent=''
      }
      apply()
    }
  }
  function photoInput(id,prop,width,height) {
    $(id).onchange=async event=>{
      const file=event.target.files[0]
      if(!file)return
      const job=Symbol()
      pending.set(prop,job);save.disabled=true
      try {
        const photo=await fitPhoto(file,width,height)
        if(pending.get(prop)!==job)return
        draft[prop]=photo;$('appearance-note').textContent='';apply()
      } catch(error) {
        if(pending.get(prop)===job)$('appearance-note').textContent=error.message
      } finally {
        if(pending.get(prop)===job){pending.delete(prop);$(id).value=''}
        save.disabled=pending.size>0
      }
    }
  }
  photoInput('art-file','photo',1280,900)
  photoInput('page-photo-file','pagePhoto',1920,1080)
  $('page-photo-remove').onclick=()=>{
    pending.delete('pagePhoto');save.disabled=pending.size>0
    draft.pagePhoto='';draft.page='auto';$('page-palette').value='auto'
    $('appearance-note').textContent='Bấm Lưu giao diện để gỡ ảnh nền.';apply()
  }
  $('appearance-default').onclick=()=>{draft={...defaults};sync()}
  form.onsubmit=e=>{
    e.preventDefault()
    if(pending.size)return
    if(draft.mode==='image'&&!draft.photo){$('appearance-note').textContent='Chọn một ảnh trên thiết bị trước khi lưu.';return}
    if(draft.page==='image'&&!draft.pagePhoto){$('appearance-note').textContent='Chọn ảnh nền toàn trang trước khi lưu.';return}
    const next={...draft,pagePhoto:draft.page==='image'?draft.pagePhoto:''}
    try {localStorage.setItem(key,JSON.stringify(next));saved=next;modal.close();notify('Đã lưu giao diện.')}
    catch {$('appearance-note').textContent='Bộ nhớ trình duyệt đã đầy hoặc bị khóa. Hãy thử ảnh nhỏ hơn.'}
  }
  apply()
}
