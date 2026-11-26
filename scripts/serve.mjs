import http from 'node:http'
import path from 'node:path'
import { createReadStream, existsSync } from 'node:fs'
import { stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const root = fileURLToPath(new URL('../docs/', import.meta.url))
if (!existsSync(path.join(root, 'index.html'))) {
  console.error('Thiếu bản web. Chạy npm ci rồi npm run build.')
  process.exit(1)
}
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.wasm':'application/wasm', '.json':'application/json', '.svg':'image/svg+xml', '.zip':'application/zip' }
const server = http.createServer(async (req, res) => {
  try {
    const route = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const file = path.resolve(root, '.' + (route === '/' ? '/index.html' : route))
    if (!file.startsWith(path.resolve(root) + path.sep) || !(await stat(file)).isFile()) throw Error()
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' })
    createReadStream(file).on('error', () => res.destroy()).pipe(res)
  } catch { res.writeHead(404).end() }
})
server.on('error', err => {
  if (err.code === 'EADDRINUSE') { server.listen(0, '127.0.0.1'); return }
  throw err
})
server.once('listening', () => {
  const url = 'http://127.0.0.1:' + server.address().port
  console.log('PyLab: ' + url + '   |   Ctrl+C để đóng.')
  if (process.argv.includes('--open') && process.platform === 'win32') {
    spawn('rundll32.exe', ['url.dll,FileProtocolHandler', url], { detached: true, stdio: 'ignore' }).unref()
  }
})
server.listen(Number(process.env.PORT || 4173), '127.0.0.1')
