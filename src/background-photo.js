const MAX_BYTES = 8 * 1024 * 1024
const MAX_PIXELS = 32_000_000
const jpegFrames = new Set([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf])
const invalid = () => new Error('Tệp ảnh không hợp lệ. Hãy chọn ảnh JPG, PNG hoặc WebP.')

function jpegDimensions(view) {
  for (let pos = 2; pos + 4 <= view.byteLength;) {
    if (view.getUint8(pos++) !== 0xff) break
    while (pos < view.byteLength && view.getUint8(pos) === 0xff) pos++
    if (pos + 3 > view.byteLength) break
    const marker = view.getUint8(pos++)
    const size = view.getUint16(pos)
    if (marker === 0xda || marker === 0xd9 || size < 2 || pos + size > view.byteLength) break
    if (jpegFrames.has(marker) && size >= 8) return [view.getUint16(pos + 5), view.getUint16(pos + 3)]
    pos += size
  }
  throw invalid()
}

function dimensions(view, mime) {
  if (view.byteLength < 24) throw invalid()
  if (mime === 'image/png' && view.getUint32(0) === 0x89504e47 && view.getUint32(4) === 0x0d0a1a0a
      && view.getUint32(12) === 0x49484452) return [view.getUint32(16), view.getUint32(20)]
  if (mime === 'image/jpeg' && view.getUint16(0) === 0xffd8) return jpegDimensions(view)
  if (mime === 'image/webp' && view.getUint32(0) === 0x52494646 && view.getUint32(8) === 0x57454250) {
    const tag = view.getUint32(12)
    if (tag === 0x56503858 && view.byteLength >= 30) { // VP8X canvas dimensions are stored minus one.
      return [1 + (view.getUint16(24,true) | view.getUint8(26) << 16),
              1 + (view.getUint16(27,true) | view.getUint8(29) << 16)]
    }
    if (tag === 0x5650384c && view.byteLength >= 25 && view.getUint8(20) === 0x2f) {
      const bits = view.getUint32(21,true)
      return [1 + (bits & 0x3fff), 1 + ((bits >>> 14) & 0x3fff)]
    }
    if (tag === 0x56503820 && view.byteLength >= 30 && view.getUint16(23) === 0x9d01 && view.getUint8(25) === 0x2a) {
      return [view.getUint16(26,true) & 0x3fff, view.getUint16(28,true) & 0x3fff]
    }
  }
  throw invalid()
}

export async function fitPhoto(file, maxWidth, maxHeight) {
  if (!['image/png','image/jpeg','image/webp'].includes(file.type)) throw invalid()
  if (file.size > MAX_BYTES) throw Error('Ảnh nền tối đa 8 MB.')
  const [width,height] = dimensions(new DataView(await file.arrayBuffer()), file.type)
  if (!width || !height || width * height > MAX_PIXELS) throw Error('Hãy chọn ảnh có tối đa 32 triệu điểm ảnh.')
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const ratio = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1,Math.round(img.naturalWidth * ratio))
    canvas.height = Math.max(1,Math.round(img.naturalHeight * ratio))
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#23342b'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.drawImage(img,0,0,canvas.width,canvas.height)
    return canvas.toDataURL('image/jpeg',.78)
  } finally {URL.revokeObjectURL(url)}
}
