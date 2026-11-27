const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

const tracer = document.createElement('span')
tracer.className = 'pointer-tracer'
tracer.setAttribute('aria-hidden', 'true')
let frame = 0, idleTimer
document.addEventListener('pointermove', event => {
  cancelAnimationFrame(frame)
  if (event.pointerType !== 'mouse' || reducedMotion.matches || event.buttons || event.target.closest('.pane')) {
    tracer.remove()
    return
  }
  frame = requestAnimationFrame(() => {
    const layer = event.target.closest('dialog[open]') || document.body
    if (tracer.parentElement !== layer) layer.append(tracer)
    tracer.style.transform = 'translate(' + (event.clientX + 13) + 'px,' + (event.clientY + 15) + 'px)'
    clearTimeout(idleTimer)
    idleTimer = setTimeout(() => tracer.remove(), 180)
  })
}, {passive: true})

// A single short pulse follows clicks, including controls created inside modal dialogs.
const pulse = document.createElement('span')
pulse.className = 'click-pulse'
pulse.setAttribute('aria-hidden', 'true')
let animation
document.addEventListener('pointerdown', event => {
  if (!event.isPrimary || event.button !== 0 || reducedMotion.matches || event.target.closest('.pane')) return
  const layer = event.target.closest('dialog[open]') || document.body
  animation?.cancel()
  layer.append(pulse)
  pulse.style.left = event.clientX + 'px'
  pulse.style.top = event.clientY + 'px'
  animation = pulse.animate([
    {transform: 'translate(-50%, -50%) scale(.35) rotate(0deg)', opacity: .95},
    {transform: 'translate(-50%, -50%) scale(1.55) rotate(35deg)', opacity: 0}
  ], {duration: 300, easing: 'ease-out'})
  animation.onfinish = () => pulse.remove()
}, {capture: true, passive: true})
