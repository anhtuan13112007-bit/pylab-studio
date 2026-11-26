// A perspective height field with hidden surfaces painted from back to front.
export function drawTerrain(canvas) {
  function paint() {
    const {width, height} = canvas.getBoundingClientRect()
    if (!width || !height) return
    const scale = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * scale)
    canvas.height = Math.round(height * scale)
    const c = canvas.getContext('2d')
    c.scale(scale, scale)
    c.clearRect(0, 0, width, height)
    const w = 570, h = 180
    const fit = Math.min(width / w, height / h)
    c.translate(width - w * fit, height - h * fit)
    c.scale(fit, fit)
    c.fillStyle = '#d6e992'
    c.beginPath(); c.arc(430, 48, 24, 0, Math.PI * 2); c.fill()
    function point(i, j) {
      const x = i / 46, z = j / 23
      const peak = (cx, cz, sx, sz, amp) => amp * Math.exp(-((x-cx)**2 / sx + (z-cz)**2 / sz))
      const y = peak(.61,.42,.010,.088,114) + peak(.85,.48,.016,.09,74) + peak(.34,.63,.018,.10,54)
      const ripples = (Math.sin(x*33+z*7)*3 + Math.sin(x*60-z*17)*2) * Math.min(1, y/30)
      return [x*600 + (z-.5)*90 - 5, 84 + z*120 - y + ripples]
    }
    for (let j=0; j<23; j++) {
      for (let i=0; i<46; i++) {
        const p = [point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)]
        c.beginPath(); c.moveTo(...p[0]); p.slice(1).forEach(v=>c.lineTo(...v)); c.closePath()
        const light = Math.max(0, Math.min(1, .48 + (p[1][1]-p[0][1])*.034))
        c.fillStyle = 'rgb(' + [22+light*18,62+light*29,43+light*16].map(Math.round).join(',') + ')'
        c.fill()
        c.strokeStyle = 'rgba(167,208,130,' + (.24+light*.36) + ')'
        c.lineWidth = .72; c.stroke()
      }
    }
    c.strokeStyle='rgba(207,231,167,.55)'; c.lineWidth=1
    for (const [x,y] of [[206,35],[505,24],[333,58],[121,95]]) {
      c.beginPath(); c.moveTo(x-3,y); c.lineTo(x+3,y); c.moveTo(x,y-3); c.lineTo(x,y+3); c.stroke()
    }
  }
  const observer = new ResizeObserver(paint)
  observer.observe(canvas); paint()
}
