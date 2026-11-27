const key = 'pylab.panes.v1'
const clamp = (value, min, max) => Math.min(max, Math.max(min, Math.round(value)))

export function setupPaneSizing() {
  const panels = document.querySelector('.panels')
  const stacked = matchMedia('(max-width: 700px)')
  const dialog = document.getElementById('size-dialog')
  const width = document.getElementById('pane-width')
  const height = document.getElementById('pane-height')
  const layout = {side: {}, stack: {}}
  let selected

  // Keep separate dimensions when the two columns turn into two rows.
  try {
    const stored = JSON.parse(localStorage.getItem(key))
    for (const mode of Object.keys(layout)) {
      const keys = ['editorHeight', 'terminalHeight', ...(mode === 'side' ? ['share'] : ['editorWidth', 'terminalWidth'])]
      for (const prop of keys) {
        const value = stored?.[mode]?.[prop]
        if (Number.isFinite(value)) layout[mode][prop] = prop.endsWith('Height')
          ? clamp(value, 200, 2000) : clamp(value, prop === 'share' ? 30 : 1, prop === 'share' ? 70 : 100)
      }
    }
  } catch { /* Use the responsive defaults when storage is unavailable. */ }

  const settings = () => stacked.matches ? layout.stack : layout.side
  function save() {
    try { localStorage.setItem(key, JSON.stringify(layout)) } catch { /* Sizing still works for this visit. */ }
  }
  function apply() {
    const prefs = settings()
    for (const pane of ['editor', 'terminal']) {
      const share = pane === 'editor' ? prefs.share : 100 - prefs.share
      panels.style.setProperty('--' + pane + '-track', prefs.share == null ? '' : share + 'fr')
      panels.style.setProperty('--' + pane + '-width', prefs[pane + 'Width'] == null ? '' : prefs[pane + 'Width'] + '%')
      panels.style.setProperty('--' + pane + '-height', prefs[pane + 'Height'] == null ? '' : prefs[pane + 'Height'] + 'px')
    }
  }
  function dimensions(grip) {
    const rect = grip.closest('.pane').getBoundingClientRect()
    const gap = stacked.matches ? 0 : parseFloat(getComputedStyle(panels).columnGap)
    const available = panels.clientWidth - gap
    return {width: rect.width, height: rect.height, available,
      min: stacked.matches ? Math.min(100, Math.ceil(22000 / available)) : 30,
      max: stacked.matches ? 100 : 70}
  }
  function setWidth(pane, percent) {
    if (stacked.matches) layout.stack[pane + 'Width'] = percent
    else layout.side.share = pane === 'editor' ? percent : 100 - percent
  }
  function syncDialog() {
    if (!dialog.open) return
    const size = dimensions(selected)
    width.min = size.min
    width.max = size.max
    width.value = clamp(size.width * 100 / size.available, size.min, size.max)
    height.value = Math.round(size.height)
    document.getElementById('pane-width-value').value = width.value + '%'
    document.getElementById('pane-height-value').value = Math.round(size.height) + ' px'
  }

  for (const grip of panels.querySelectorAll('.size-grip')) {
    const pane = grip.dataset.pane
    let drag = null, moved = false
    grip.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return
      moved = false
      drag = {...dimensions(grip), x: event.clientX, y: event.pageY, id: event.pointerId, stacked: stacked.matches}
      grip.setPointerCapture(event.pointerId)
    })
    grip.addEventListener('pointermove', event => {
      if (!drag || drag.id !== event.pointerId || drag.stacked !== stacked.matches) return
      const dx = event.clientX - drag.x, dy = event.pageY - drag.y
      if (!moved && Math.max(Math.abs(dx), Math.abs(dy)) < 4) return
      moved = true
      drag.horizontal ||= dx !== 0
      drag.vertical ||= dy !== 0
      if (drag.horizontal) {
        const delta = pane === 'terminal' && !drag.stacked ? -dx : dx
        setWidth(pane, clamp((drag.width + delta) * 100 / drag.available, drag.min, drag.max))
      }
      if (drag.vertical) settings()[pane + 'Height'] = clamp(drag.height + dy, 200, 2000)
      apply()
    })
    grip.addEventListener('lostpointercapture', () => {
      if (moved) save()
      drag = null
    })
    grip.addEventListener('click', event => {
      if (event.detail && moved) return
      selected = grip
      document.getElementById('size-title').textContent = grip.getAttribute('aria-label')
      dialog.showModal()
      syncDialog()
    })
  }
  width.addEventListener('input', () => {
    setWidth(selected.dataset.pane, Number(width.value))
    apply()
    syncDialog()
  })
  height.addEventListener('input', () => {
    settings()[selected.dataset.pane + 'Height'] = Number(height.value)
    apply()
    syncDialog()
  })
  width.addEventListener('change', save)
  height.addEventListener('change', save)
  document.getElementById('size-reset').onclick = () => {
    const pane = selected.dataset.pane, prefs = settings()
    delete prefs[pane + 'Height']
    delete prefs[stacked.matches ? pane + 'Width' : 'share']
    apply()
    syncDialog()
    save()
  }
  stacked.addEventListener('change', () => { apply(); syncDialog() })
  window.addEventListener('resize', syncDialog)
  apply()
}
