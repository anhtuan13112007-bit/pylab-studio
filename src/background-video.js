// Read the container signature and one decodable frame without loading the whole file into JS.
export async function readVideo(file,signal) {
  const bytes = new Uint8Array(await file.slice(0,12).arrayBuffer())
  const mp4 = String.fromCharCode(...bytes.subarray(4,8)) === 'ftyp'
  const webm = bytes[0]===0x1a && bytes[1]===0x45 && bytes[2]===0xdf && bytes[3]===0xa3
  if (!mp4 && !webm) throw Error('Hãy chọn video MP4 hoặc WebM.')
  signal.throwIfAborted()
  const blob = file.slice(0,file.size,mp4?'video/mp4':'video/webm')
  const probe = document.createElement('video')
  const url = URL.createObjectURL(blob)
  try {
    await new Promise((resolve,reject) => {
      const abort = () => finish(reject,signal.reason)
      const timer = setTimeout(() => finish(reject,Error('Chưa đọc được video. Hãy thử một tệp khác.')),30000)
      function finish(fn,value) {clearTimeout(timer);signal.removeEventListener('abort',abort);fn(value)}
      // All exits remove listeners, including cancellation during decoding.
      probe.onloadeddata = () => finish(resolve)
      probe.onerror = () => finish(reject,Error('Trình duyệt chưa phát được video này. Hãy thử MP4/H.264 hoặc WebM/VP9.'))
      signal.addEventListener('abort',abort,{once:true})
      probe.muted=true;probe.playsInline=true;probe.preload='auto';probe.src=url
    })
    if (!probe.videoWidth || !probe.videoHeight) throw Error('Tệp đã chọn cần có hình ảnh video.')
    return {blob,width:probe.videoWidth,height:probe.videoHeight}
  } finally {
    probe.onloadeddata=null;probe.onerror=null;probe.removeAttribute('src');probe.load()
    URL.revokeObjectURL(url)
  }
}
