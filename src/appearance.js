import { drawTerrain } from './terrain.js'

const defaults = {mode:'terrain',color:'#193e2b',opacity:100,page:'auto',photo:''}
const key='pylab.appearance.v1'
const $=id=>document.getElementById(id)

function read() {
  try {
    const raw=JSON.parse(localStorage.getItem(key)) || {}
    return {
      mode:['terrain','wave','stars','plain','image'].includes(raw.mode)?raw.mode:defaults.mode,
      color:/^#[\da-f]{6}$/i.test(raw.color)?raw.color:defaults.color,
      opacity:Number.isFinite(raw.opacity)?Math.max(0,Math.min(100,raw.opacity)):100,
      page:['auto','sky','lavender','sand'].includes(raw.page)?raw.page:'auto',
      photo:/^data:image\/jpeg;base64,[a-zA-Z\d+/=]+$/.test(raw.photo)?raw.photo:''
    }
  } catch {return {...defaults}}
}

async function fitPhoto(file) {
  if(!['image/png','image/jpeg','image/webp'].includes(file.type))throw Error('Hãy chọn ảnh JPG, PNG hoặc WebP.')
  const url=URL.createObjectURL(file)
  try {
    const img=new Image();img.src=url;await img.decode()
    const ratio=Math.min(1,1280/img.width,900/img.height)
    const canvas=document.createElement('canvas')
    canvas.width=Math.max(1,Math.round(img.width*ratio));canvas.height=Math.max(1,Math.round(img.height*ratio))
    const ctx=canvas.getContext('2d');ctx.fillStyle='#23342b';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height)
    return canvas.toDataURL('image/jpeg',.78)
  } finally {URL.revokeObjectURL(url)}
}

export function setupAppearance(notify) {
  let saved=read(), draft={...saved}, imageJob=0
  const modal=$('appearance-dialog'), form=$('appearance-form')
  const save=form.querySelector('button[type=submit]')
  const banners=[$('hero'),modal.querySelector('.appearance-preview')]
  const paintings=[$('terrain'),$('preview-art')].map(canvas=>drawTerrain(canvas,()=>draft.mode))
  function apply() {
    document.documentElement.dataset.palette=draft.page
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
    save.disabled=false;$('art-file').value='';$('appearance-note').textContent='';apply()
  }
  $('appearance').onclick=()=>{draft={...saved};modal.showModal();sync()}
  $('appearance-close').onclick=()=>modal.close()
  modal.addEventListener('close',()=>{imageJob++;draft={...saved};apply()})
  modal.addEventListener('click',e=>{if(e.target===modal)modal.close()})
  for(const [id,prop] of [['art-mode','mode'],['art-color','color'],['art-opacity','opacity'],['page-palette','page']]){
    $(id).oninput=()=>{draft[prop]=prop==='opacity'?Number($(id).value):$(id).value;apply()}
  }
  $('art-file').onchange=async e=>{
    const file=e.target.files[0], job=++imageJob
    if(!file)return
    save.disabled=true
    try {const photo=await fitPhoto(file);if(job===imageJob){draft.photo=photo;$('appearance-note').textContent='';apply()}}
    catch(error){if(job===imageJob)$('appearance-note').textContent=error.message}
    finally {if(job===imageJob)save.disabled=false}
  }
  $('appearance-default').onclick=()=>{imageJob++;draft={...defaults};sync()}
  form.onsubmit=e=>{
    e.preventDefault()
    if(draft.mode==='image'&&!draft.photo){$('appearance-note').textContent='Chọn một ảnh trên thiết bị trước khi lưu.';return}
    try {localStorage.setItem(key,JSON.stringify(draft));saved={...draft};modal.close();notify('Đã lưu giao diện.')}
    catch {$('appearance-note').textContent='Bộ nhớ trình duyệt đã đầy hoặc bị khóa. Hãy thử ảnh nhỏ hơn.'}
  }
  apply()
}
