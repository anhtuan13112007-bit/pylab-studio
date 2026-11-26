const form = document.getElementById('terminal-form')
const field = document.getElementById('terminal-line')
let token = null, seq = null, reply, answer
const service = navigator.serviceWorker
let connection

async function connect() {
  if (!service) return null
  await service.register(new URL('terminal-sw.js', document.baseURI))
  await service.ready
  if (!service.controller) {
    await new Promise(resolve=>service.addEventListener('controllerchange',resolve,{once:true}))
  }
  const channel = new MessageChannel()
  return new Promise(resolve=>{
    channel.port1.onmessage=e=>{channel.port1.close();resolve(e.data)}
    service.controller.postMessage({type:'terminal-client'},[channel.port2])
  })
}

export async function terminalClient() {
  if (!connection) connection=connect().catch(()=>null)
  let timer
  try {
    return await Promise.race([connection,new Promise(resolve=>{timer=setTimeout(()=>resolve(null),4500)})])
  } finally {clearTimeout(timer)}
}

export function setTerminalRun(id) {
  if(reply){reply.postMessage({closed:true});reply.close()}
  token=id;seq=null;reply=null;answer=undefined;form.hidden=true;field.value=''
}

export function handleReads(onWaiting,onSubmitted) {
  service?.addEventListener('message',event=>{
    if(event.data?.type!=='terminal-read')return
    const port=event.ports[0]
    if(!port)return
    if(!token || event.data.token!==token){port.postMessage({closed:true});port.close();return}
    if(seq!==event.data.seq){
      seq=event.data.seq;answer=undefined
      field.value='';form.hidden=false;onWaiting()
      field.focus();form.scrollIntoView({block:'nearest'})
    }
    if(answer!==undefined){port.postMessage(answer);port.close();return}
    reply?.close();reply=port
  })
  function submit(eof) {
    if(form.hidden)return
    answer=eof?{eof:true}:{line:field.value}
    if(reply){reply.postMessage(answer);reply.close();reply=null}
    form.hidden=true;field.value='';onSubmitted()
  }
  form.onsubmit=event=>{event.preventDefault();submit(false)}
  document.getElementById('terminal-eof').onclick=()=>submit(true)
  field.addEventListener('keydown',event=>{
    if(event.ctrlKey && event.key.toLowerCase()==='d'){event.preventDefault();submit(true)}
    if(event.key==='Enter' && event.isComposing)event.preventDefault()
  })
}
