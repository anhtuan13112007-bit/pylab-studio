import { basicSetup } from 'codemirror'
import { Decoration, EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { indentWithTab } from '@codemirror/commands'
import { python } from '@codemirror/lang-python'
import { indentUnit, HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

const colors = HighlightStyle.define([
  {tag:[t.keyword,t.controlKeyword],color:'var(--tok-keyword)'},
  {tag:[t.string,t.special(t.string)],color:'var(--tok-string)'},
  {tag:[t.number,t.bool,t.null],color:'var(--tok-number)'},
  {tag:[t.function(t.variableName),t.standard(t.variableName)],color:'var(--tok-function)'},
  {tag:t.comment,color:'var(--tok-comment)',fontStyle:'italic'}
])

// CodeMirror draws the selection background behind the syntax-colored text.
const selectedText = Decoration.mark({class: 'cm-selectedText'})
const selectionTextColors = EditorView.decorations.compute(['selection'], state =>
  Decoration.set(state.selection.ranges.filter(range => !range.empty)
    .map(range => selectedText.range(range.from, range.to)))
)

export function createEditor(parent, doc, onChange, onCursor, run) {
  const extensions = [
    keymap.of(['Mod-b','Mod-Enter'].map(key=>({key,run:()=>{run();return true}}))),
    basicSetup, python(), syntaxHighlighting(colors), selectionTextColors, keymap.of([indentWithTab]), indentUnit.of('    '),
    EditorState.tabSize.of(4),
    EditorView.contentAttributes.of({'aria-label':'Mã nguồn Python', spellcheck:'false', autocapitalize:'off'}),
    EditorView.updateListener.of(update => {
      if (update.docChanged) onChange(update.state.doc.toString())
      if (update.selectionSet || update.docChanged) {
        const pos = update.state.selection.main.head
        const line = update.state.doc.lineAt(pos)
        onCursor(line.number, pos-line.from+1)
      }
    })
  ]
  const state = text => EditorState.create({doc:text,extensions})
  const view = new EditorView({state:state(doc),parent})
  return {
    open(text) { view.setState(state(text)); onCursor(1,1) },
    focus() { view.focus() },
    measure() { view.requestMeasure() }
  }
}
