// Deliver one stdin request from the dedicated Python worker to its own tab.
// No application assets are intercepted or cached by this service worker.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
self.addEventListener('message', event => {
  if (event.data?.type === 'terminal-client' && event.source?.type === 'window') {
    event.ports[0]?.postMessage(event.source.id)
  }
})

const endpoint = new URL('__terminal_input__', self.registration.scope).pathname
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'POST' || url.origin !== self.location.origin || url.pathname !== endpoint) return
  event.respondWith(readLine(event.request))
})

async function readLine(request) {
  const {owner, token, seq} = await request.json()
  const client = await self.clients.get(owner)
  const reply = value => new Response(JSON.stringify(value), {headers:{'Content-Type':'application/json','Cache-Control':'no-store'}})
  if (!client || client.type !== 'window') return reply({closed:true})
  const channel = new MessageChannel()
  return new Promise(resolve => {
    function finish(value) {
      clearTimeout(timer)
      channel.port1.close()
      resolve(reply(value))
    }
    // Keep individual requests short even if someone takes minutes to type.
    const timer = setTimeout(()=>finish({pending:true}), 10000)
    channel.port1.onmessage = event => finish(event.data)
    client.postMessage({type:'terminal-read',token,seq},[channel.port2])
  })
}
