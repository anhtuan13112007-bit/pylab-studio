const plots = new Map()
const dialog = document.getElementById('plot-dialog')
const preview = document.getElementById('plot-preview')
const caption = document.getElementById('plot-title')
const download = document.getElementById('plot-download')
let selected = null

function updatePreview(plot) {
  preview.src = plot.url
  preview.alt = plot.label
  caption.textContent = plot.label
  download.href = plot.url
  download.download = 'do-thi-' + plot.number + '.png'
}

dialog.addEventListener('close', () => {
  selected = null
  preview.removeAttribute('src')
  download.removeAttribute('href')
})
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close() })

export function displayPlot(data, output, panel) {
  const follow = panel.scrollHeight - panel.clientHeight - panel.scrollTop < 36
  let plot = plots.get(data.id)
  if (!plot) {
    const figure = document.createElement('figure')
    figure.className = 'terminal-chart'
    const button = document.createElement('button')
    button.type = 'button'
    const image = document.createElement('img')
    const description = document.createElement('figcaption')
    button.append(image)
    figure.append(button, description)
    output.append(figure)
    plot = {button, image, description, number:data.number}
    plots.set(data.id, plot)
    button.onclick = () => { selected = plot; updatePreview(plot); dialog.showModal() }
  }
  const previous = plot.url
  plot.url = URL.createObjectURL(data.png)
  plot.label = data.title || 'Đồ thị ' + data.number
  plot.description.textContent = plot.label
  plot.button.setAttribute('aria-label', 'Phóng to đồ thị: ' + plot.label)
  plot.image.alt = plot.label
  plot.image.onload = () => { if (follow) panel.scrollTop = panel.scrollHeight }
  plot.image.src = plot.url
  if (selected === plot) updatePreview(plot)
  if (previous) URL.revokeObjectURL(previous)
}

export function clearPlots() {
  if (dialog.open) dialog.close()
  for (const plot of plots.values()) URL.revokeObjectURL(plot.url)
  plots.clear()
}
