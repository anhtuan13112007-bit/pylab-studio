const form = document.getElementById('terminal-form')
const field = document.getElementById('terminal-line')
let answer
export function closeInput() {
  answer = undefined
  form.hidden = true
  field.value = ''
}
export function requestInput(callback) {
  if (answer) return
  answer = callback
  form.hidden = false
  field.focus()
  form.scrollIntoView({block:'nearest'})
}
function submit(value) {
  if (!answer) return
  const send = answer
  closeInput()
  send(value)
}
form.onsubmit = event => {event.preventDefault();submit(field.value)}
document.getElementById('terminal-eof').onclick = () => submit(null)
field.onkeydown = event => {
  if (event.ctrlKey && event.key.toLowerCase() === 'd') {event.preventDefault();submit(null)}
  if (event.key === 'Enter' && event.isComposing) event.preventDefault()
}
