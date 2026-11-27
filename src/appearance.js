import { fitPhoto } from './background-photo.js'
import { readVideo } from './background-video.js'
import { openAppearanceStore } from './appearance-store.js'
import { icon } from './icons.js'

const $ = id => document.getElementById(id)
const smallerMotion = matchMedia('(prefers-reduced-motion: reduce)')
const defaults = () => ({page:'auto',pagePhoto:'',video:null,editorGlass:30,terminalGlass:25,animate:!smallerMotion.matches})
const percent = (value,fallback) => Number.isFinite(value) ? Math.max(0,Math.min(100,Math.round(value))) : fallback

function restore(raw) {
  const value = defaults()
  if (!raw) return value
  value.editorGlass=percent(raw.editorGlass,value.editorGlass)
  value.terminalGlass=percent(raw.terminalGlass,value.terminalGlass)
  if (typeof raw.animate==='boolean') value.animate=raw.animate
  if (raw.page==='image' && typeof raw.pagePhoto==='string' && raw.pagePhoto.length<=3*1024*1024
    && /^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(raw.pagePhoto)) {
    value.page='image';value.pagePhoto=raw.pagePhoto
  } else if (raw.page==='video' && raw.video?.blob instanceof Blob
      && ['video/mp4','video/webm'].includes(raw.video.blob.type)) {
    value.page='video';value.video=raw.video
  } else if (['sky','lavender','sand'].includes(raw.page)) value.page=raw.page
  return value
}

export function setupAppearance(notify) {
  const modal=$('appearance-dialog'), form=$('appearance-form'), video=$('wallpaper-video')
  const wallpaper=$('page-wallpaper'), motion=$('video-motion'), note=$('appearance-note')
  const submit=form.querySelector('[type=submit]')
  let saved=defaults(), draft={...saved}, loading=null, saving=false
  let blob=null, url='', blocked=false, playAttempt=0
  const store=openAppearanceStore()
  const ready=store.then(db=>db.read()).then(raw=>{
    saved=restore(raw);draft={...saved};apply()
  }).catch(()=>notify('Chưa đọc được giao diện đã lưu.'))

  function motionLabel() {
    const label=draft.animate && !blocked ? 'Tạm dừng video nền' : 'Phát video nền'
    motion.title=label;motion.setAttribute('aria-label',label)
    motion.replaceChildren(icon(draft.animate && !blocked?'pause':'play'))
  }
  function playback() {
    const attempt=++playAttempt
    if (!blob || !draft.animate || document.hidden) video.pause()
    else video.play().catch(error=>{
      if (attempt!==playAttempt || error.name==='AbortError') return
      blocked=true;motionLabel()
    })
    motionLabel()
  }
  function updateVideo() {
    const next=draft.page==='video'?draft.video?.blob:null
    if ((next || null)===blob) return
    video.pause()
    video.removeAttribute('src');video.load()
    if (url) URL.revokeObjectURL(url)
    url='';blob=next || null;blocked=false
    video.hidden=!blob;motion.hidden=!blob
    if (blob) {url=URL.createObjectURL(blob);video.src=url}
    playback()
  }
  function apply() {
    document.documentElement.dataset.palette=draft.page
    for(const [prop,id] of [['editorGlass','editor-glass'],['terminalGlass','terminal-glass']]) {
      document.documentElement.style.setProperty('--'+id+'-fill',(100-draft[prop])+'%')
      $(id).value=draft[prop];$(id+'-value').textContent=draft[prop]+'%'
    }
    const photo=draft.page==='image' && draft.pagePhoto
    wallpaper.style.backgroundImage=photo?'url("'+photo+'")':'none'
    wallpaper.hidden=!photo && !(draft.page==='video' && draft.video)
    $('page-palette').value=draft.page
    $('page-image-control').hidden=draft.page!=='image'
    $('page-video-control').hidden=draft.page!=='video'
    $('page-photo-tools').hidden=!photo
    const preview=$('page-photo-preview')
    if (photo && preview.getAttribute('src')!==photo) preview.src=photo
    if (!photo) preview.removeAttribute('src')
    $('video-tools').hidden=!draft.video
    $('video-size').textContent=draft.video ? draft.video.width+' × '+draft.video.height : ''
    updateVideo()
  }
  function cancelLoad() {
    loading?.abort();loading=null
    submit.disabled=saving
  }
  function resetForm() {
    cancelLoad();note.textContent=''
    $('video-file').value='';$('page-photo-file').value='';apply()
  }
  $('appearance').onclick=async()=>{
    await ready
    draft={...saved};resetForm();modal.showModal()
  }
  $('appearance-close').onclick=()=>{if(!saving)modal.close()}
  modal.addEventListener('cancel',event=>{if(saving)event.preventDefault()})
  modal.addEventListener('click',event=>{if(event.target===modal && !saving)modal.close()})
  modal.addEventListener('close',()=>{draft={...saved};resetForm()})
  $('page-palette').oninput=()=>{cancelLoad();note.textContent='';draft.page=$('page-palette').value;apply()}
  for (const [id,prop] of [['editor-glass','editorGlass'],['terminal-glass','terminalGlass']]) {
    $(id).oninput=()=>{draft[prop]=Number($(id).value);apply()}
  }
  function picker(id,prop,read) {
    $(id).onchange=async event=>{
      const file=event.target.files[0]
      if(!file)return
      cancelLoad()
      const job=new AbortController()
      loading=job;submit.disabled=true;note.textContent='Đang mở tệp…'
      try {
        const media=await read(file,job.signal)
        if(job!==loading)return
        draft[prop]=media;note.textContent='';apply()
      } catch(error) {
        if(job===loading)note.textContent=error.message
      } finally {
        if(job===loading){loading=null;submit.disabled=false;$(id).value=''}
      }
    }
  }
  picker('page-photo-file','pagePhoto',file=>fitPhoto(file,1920,1080))
  picker('video-file','video',readVideo)
  function removeMedia(prop) {
    cancelLoad();draft[prop]=prop==='video'?null:'';draft.page='auto';apply()
    note.textContent='Bấm Lưu giao diện để gỡ hình nền.'
  }
  $('page-photo-remove').onclick=()=>removeMedia('pagePhoto')
  $('video-remove').onclick=()=>removeMedia('video')
  $('appearance-default').onclick=()=>{draft=defaults();resetForm()}

  async function persist(next) {
    saving=true;form.inert=true;motion.disabled=true
    try {
      await (await store).write(next)
      saved=next
      return true
    } catch(error) {
      const message=error.name==='QuotaExceededError'?'Bộ nhớ trình duyệt đã đầy. Hãy chọn video nhỏ hơn.':
        error.message || 'Không lưu được giao diện trên thiết bị.'
      if(modal.open) note.textContent=message
      else notify(message)
      return false
    } finally {saving=false;form.inert=false;motion.disabled=false}
  }
  form.onsubmit=async event=>{
    event.preventDefault()
    if (loading || saving) return
    if (draft.page==='video' && !draft.video || draft.page==='image' && !draft.pagePhoto) {
      note.textContent='Hãy chọn một tệp trên thiết bị trước khi lưu.';return
    }
    const next={...draft,video:draft.page==='video'?draft.video:null,pagePhoto:draft.page==='image'?draft.pagePhoto:''}
    if(await persist(next)){modal.close();notify('Đã lưu giao diện.')}
  }
  motion.onclick=async()=>{
    if(saving)return
    draft.animate=blocked || !draft.animate;blocked=false;playback()
    if(!modal.open && !(await persist({...saved,animate:draft.animate}))) {
      draft.animate=saved.animate;playback()
    }
  }
  document.addEventListener('visibilitychange',playback)
  apply()
}
