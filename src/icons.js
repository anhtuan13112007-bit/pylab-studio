import icon0 from 'lucide/icons/square-code.svg?raw'
import icon1 from 'lucide/icons/library-big.svg?raw'
import icon2 from 'lucide/icons/plus.svg?raw'
import icon3 from 'lucide/icons/upload.svg?raw'
import icon4 from 'lucide/icons/circle-help.svg?raw'
import icon5 from 'lucide/icons/laptop.svg?raw'
import left from 'lucide/icons/chevron-left.svg?raw'
import right from 'lucide/icons/chevron-right.svg?raw'
import picture from 'lucide/icons/image.svg?raw'
import pause from 'lucide/icons/pause.svg?raw'
import icon8 from 'lucide/icons/hard-drive.svg?raw'
import icon9 from 'lucide/icons/moon.svg?raw'
import icon10 from 'lucide/icons/sun.svg?raw'
import icon11 from 'lucide/icons/play.svg?raw'
import icon12 from 'lucide/icons/download.svg?raw'
import icon13 from 'lucide/icons/maximize-2.svg?raw'
import icon14 from 'lucide/icons/minimize-2.svg?raw'
import icon15 from 'lucide/icons/terminal.svg?raw'
import icon16 from 'lucide/icons/trash-2.svg?raw'
import icon17 from 'lucide/icons/code.svg?raw'
import icon18 from 'lucide/icons/search.svg?raw'
import icon19 from 'lucide/icons/x.svg?raw'
import icon20 from 'lucide/icons/hand.svg?raw'
import icon21 from 'lucide/icons/infinity.svg?raw'
import icon22 from 'lucide/icons/pyramid.svg?raw'
import icon23 from 'lucide/icons/keyboard.svg?raw'
import icon24 from 'lucide/icons/chart-column.svg?raw'
import icon25 from 'lucide/icons/calculator.svg?raw'
import icon26 from 'lucide/icons/list-ordered.svg?raw'
import icon27 from 'lucide/icons/variable.svg?raw'
import icon28 from 'lucide/icons/file-code-2.svg?raw'
import icon29 from 'lucide/icons/square.svg?raw'
import icon30 from 'lucide/icons/cloud-off.svg?raw'
import icon31 from 'lucide/icons/clock-3.svg?raw'
import icon32 from 'lucide/icons/ellipsis.svg?raw'
import icon33 from 'lucide/icons/check-check.svg?raw'

const images = {
  'square-code': icon0,
  'library-big': icon1,
  'plus': icon2,
  'upload': icon3,
  'circle-help': icon4,
  'laptop': icon5,
  'chevron-left': left,
  'chevron-right': right,
  image: picture,
  pause,
  'hard-drive': icon8,
  'moon': icon9,
  'sun': icon10,
  'play': icon11,
  'download': icon12,
  'maximize-2': icon13,
  'minimize-2': icon14,
  'terminal': icon15,
  'trash-2': icon16,
  'code': icon17,
  'search': icon18,
  'x': icon19,
  'hand': icon20,
  'infinity': icon21,
  'pyramid': icon22,
  'keyboard': icon23,
  'chart-column': icon24,
  'calculator': icon25,
  'list-ordered': icon26,
  'variable': icon27,
  'file-code-2': icon28,
  'square': icon29,
  'cloud-off': icon30,
  'clock-3': icon31,
  'ellipsis': icon32,
  'check-check': icon33
}
images['cloud-check'] = images['check-check']
images['code-2'] = images.code

export function icon(name) {
  const template = document.createElement('template')
  template.innerHTML = images[name] || images.code
  const svg = template.content.querySelector('svg')
  svg.setAttribute('aria-hidden', 'true')
  return svg
}
export function renderIcons(root = document) {
  for (const node of root.querySelectorAll('[data-i]')) {
    const svg = icon(node.dataset.i)
    if (node.className) svg.classList.add(...node.className.split(' '))
    node.replaceWith(svg)
  }
}
