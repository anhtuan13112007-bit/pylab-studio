import test from 'node:test'
import assert from 'node:assert/strict'
import {readFile} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import vm from 'node:vm'
import {filesForRun, checkPackages} from '../src/run-permissions.js'
import {fitPhoto} from '../src/background-photo.js'
import {readVideo} from '../src/background-video.js'

test('Video nền kiểm tra chữ ký tệp và có thể hủy trước khi mở bộ giải mã', async () => {
  const signal=new AbortController().signal
  await assert.rejects(readVideo(new Blob(['fixture'],{type:'video/mp4'}),signal),/MP4 hoặc WebM/)
  const stop=new AbortController()
  stop.abort()
  const header=Uint8Array.from([0x1a,0x45,0xdf,0xa3])
  await assert.rejects(readVideo(new Blob([header]),stop.signal),{name:'AbortError'})
})

test('Kiểm tra loại ảnh, dung lượng và số điểm ảnh trước khi giải mã', async () => {
  await assert.rejects(fitPhoto(new Blob(['fixture'],{type:'image/svg+xml'}),1920,1080),/không hợp lệ/)
  await assert.rejects(fitPhoto(new Blob(['fixture'],{type:'image/png'}),1920,1080),/không hợp lệ/)
  await assert.rejects(fitPhoto({type:'image/jpeg',size:8*1024*1024+1},1920,1080),/8 MB/)
  const data = new DataView(new ArrayBuffer(24))
  data.setUint32(0,0x89504e47);data.setUint32(4,0x0d0a1a0a);data.setUint32(8,13)
  data.setUint32(12,0x49484452);data.setUint32(16,8000);data.setUint32(20,5000)
  await assert.rejects(fitPhoto(new Blob([data],{type:'image/png'}),1920,1080),/32 triệu/)
})

const files = ['bai.py','cong_cu.py','bai_khac.py'].map((name,id) => ({
  id:String(id), name, code:'print(42)', stdin:'fixture'
}))

test('Chỉ mã của tệp đang mở và mô-đun được chọn đi vào bộ chạy', () => {
  assert.deepEqual(filesForRun(files,files[0]), [{name:'bai.py',code:'print(42)'}])
  const shared = filesForRun(files,files[0],['1'])
  assert.deepEqual(shared.map(file => file.name), ['bai.py','cong_cu.py'])
  assert.ok(shared.every(file => !Object.hasOwn(file,'stdin')))
})

test('Phát hiện tên không hợp lệ hoặc ID bị trùng trước khi chuyển tệp', () => {
  for (const name of ['sub/file.py','NUL.py','COM¹.py','demo:stream.py']) {
    const items = [{...files[0],name}]
    assert.throws(() => filesForRun(items,items[0]))
  }
  assert.throws(() => filesForRun([files[0], {...files[1], id:files[0].id}],files[0]))
})

test('Khai báo gói chỉ nhận tên và tùy chọn ghim phiên bản', () => {
  assert.deepEqual(checkPackages('# fixture\nhumanize==4.12.3\npython-slugify'),['humanize==4.12.3','python-slugify'])
  for (const line of ['--help','test @ https://example.invalid/demo.whl','./local.whl','name >= 2']) {
    assert.throws(() => checkPackages(line))
  }
})

test('Mã khởi động trong khung cách ly khớp hash trong CSP', async () => {
  const page = (await readFile(new URL('../public/sandbox.html',import.meta.url),'utf8')).replaceAll('\r\n','\n')
  const script = page.match(/<script>([\s\S]+?)<\/script>/)[1]
  const hash = createHash('sha256').update(script).digest('base64')
  assert.ok(page.includes("'sha256-"+hash+"'"))
  assert.ok(page.includes("connect-src 'none'"))
})

async function fetchFixture(online) {
  const calls = []
  const sandbox = {
    self:{fetch:async (url,options) => {calls.push({url,options});return new Response('fixture')}},
    URL, Request, Response
  }
  const port = {postMessage:({name}) => queueMicrotask(() =>
    port.onmessage({data:{type:'asset',name,bytes:new Uint8Array([1,2,3]).buffer}}))}
  const script = await readFile(new URL('../public/package-loader.js',import.meta.url),'utf8')
  const initialize = vm.runInNewContext(script+'\nsetupRuntimeAssets',sandbox)
  initialize(port,online,()=>{})
  return {read:sandbox.self.fetch,calls}
}

test('Ngoại tuyến chỉ dùng cổng tài nguyên ảo, không gọi fetch mạng', async () => {
  const {read,calls} = await fetchFixture(false)
  const wasm = await read('https://runtime.invalid/pyodide.asm.wasm')
  assert.equal(wasm.headers.get('content-type'),'application/wasm')
  assert.equal((await wasm.arrayBuffer()).byteLength,3)
  await assert.rejects(read('https://pypi.org/pypi/fixture/json'))
  assert.equal(calls.length,0)
})

test('Chế độ tải gói chỉ cho các kho được khai báo và bỏ credentials', async () => {
  const {read,calls} = await fetchFixture(true)
  await read('https://pypi.org/pypi/fixture/json')
  await read('https://files.pythonhosted.org/fixture.whl')
  await assert.rejects(read('https://example.invalid/fixture'))
  assert.equal(calls.length,2)
  assert.ok(calls.every(({options}) => options.credentials === 'omit' && options.referrerPolicy === 'no-referrer'))
})
