import http from 'node:http'
import path from 'node:path'
import { createReadStream, existsSync } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const root = fileURLToPath(new URL('../docs/', import.meta.url))
if (!existsSync(path.join(root, 'index.html'))) {
  console.error('Thiếu bản web. Chạy npm ci rồi npm run build.')
  process.exit(1)
}
const publicRoot = await realpath(root)
const headers = {
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), usb=(), serial=(), hid=(), payment=()',
  'Content-Security-Policy':"frame-ancestors 'self'",
  'X-Frame-Options':'SAMEORIGIN'
}
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml', '.zip':'application/zip' }
const server = http.createServer(async (req, res) => {
  for (const [key,value] of Object.entries(headers)) res.setHeader(key,value)
  if (req.headers.host !== '127.0.0.1:' + server.address().port && req.headers.host !== 'localhost:' + server.address().port) {
    res.writeHead(403).end();return
  }
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405,{Allow:'GET, HEAD'}).end();return}
  try {
    const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const file = path.resolve(publicRoot, '.' + (route === '/' ? '/index.html' : route))
    if (!file.startsWith(publicRoot + path.sep)) throw Error()
    const canonical = await realpath(file)
    if (!canonical.startsWith(publicRoot + path.sep) || !(await stat(canonical)).isFile()) throw Error()
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' })
    if (req.method === 'HEAD') {res.end();return}
    createReadStream(canonical).on('error', () => res.destroy()).pipe(res)
  } catch { res.writeHead(404).end() }
})
server.on('error', err => {
  if (err.code === 'EADDRINUSE') { server.listen(0, '127.0.0.1'); return }
  throw err
})
server.once('listening', () => {
  const url = 'http://127.0.0.1:' + server.address().port
  console.log('AT Python: ' + url + '   |   Ctrl+C để đóng.')
  if (process.argv.includes('--open') && process.platform === 'win32') {
    spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { detached: true, stdio: 'ignore' }).unref()
  }
})
server.listen(Number(process.env.PORT || 4173), '127.0.0.1')
