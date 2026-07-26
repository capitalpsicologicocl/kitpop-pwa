import { useEffect, useRef } from 'react'

import { sanitizeWorkspaceHtml } from '../../utils/sanitizeHtml'

const TOOLBAR_GROUPS = [
  [
    { cmd: 'bold', label: 'B', title: 'Negrita' },
    { cmd: 'italic', label: 'I', title: 'Cursiva' },
    { cmd: 'underline', label: 'U', title: 'Subrayado' },
  ],
  [
    { cmd: 'justifyLeft', label: '≡', title: 'Alinear izquierda' },
    { cmd: 'justifyCenter', label: '≡', title: 'Centrar', className: 'center' },
    { cmd: 'justifyRight', label: '≡', title: 'Alinear derecha', className: 'right' },
  ],
  [{ cmd: 'insertUnorderedList', label: '•', title: 'Viñetas' }],
  [
    { cmd: 'fontSize', value: '2', label: 'S', title: 'Texto pequeño' },
    { cmd: 'fontSize', value: '3', label: 'M', title: 'Texto normal' },
    { cmd: 'fontSize', value: '5', label: 'L', title: 'Texto grande' },
  ],
]

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = 120,
  id,
}) {
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const node = editorRef.current

    if (!node) {
      return
    }

    const nextValue = value ?? ''

    if (node.innerHTML !== nextValue) {
      node.innerHTML = nextValue
    }
  }, [value])

  function emitChange() {
    const html = sanitizeWorkspaceHtml(editorRef.current?.innerHTML ?? '')
    onChangeRef.current(html)
  }

  useEffect(() => {
    function flushEditor() {
      emitChange()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        flushEditor()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pagehide', flushEditor)

    return () => {
      flushEditor()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pagehide', flushEditor)
    }
  }, [])

  function runCommand(command, commandValue = null) {
    editorRef.current?.focus()
    document.execCommand(command, false, commandValue)
    emitChange()
  }

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar" role="toolbar" aria-label="Formato de texto">
        {TOOLBAR_GROUPS.map((group, groupIndex) => (
          <div key={groupIndex} className="rich-text-toolbar-group">
            {group.map((item) => (
              <button
                key={`${item.cmd}-${item.value ?? item.label}`}
                type="button"
                className={`rich-text-tool ${item.className ?? ''}`}
                title={item.title}
                aria-label={item.title}
                onMouseDown={(event) => {
                  event.preventDefault()
                  runCommand(item.cmd, item.value ?? null)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div
        id={id}
        ref={editorRef}
        className="rich-text-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={emitChange}
        onBlur={emitChange}
      />
    </div>
  )
}
