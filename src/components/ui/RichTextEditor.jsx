import { forwardRef, memo, useCallback, useEffect, useRef } from 'react'

import { sanitizeWorkspaceHtml } from '../../utils/sanitizeHtml'

function RichTextIcon({ name }) {
  const props = {
    viewBox: '0 0 20 20',
    width: 18,
    height: 18,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (name) {
    case 'bold':
      return (
        <svg {...props}>
          <path d="M6 3.5h4.2a3.3 3.3 0 0 1 0 6.6H6V3.5z" fill="currentColor" stroke="none" />
          <path d="M6 10.1h4.8a3.1 3.1 0 0 1 0 6.2H6v-6.2z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'italic':
      return (
        <svg {...props}>
          <line x1="11" y1="3.5" x2="7" y2="16.5" />
          <line x1="14.5" y1="3.5" x2="8.5" y2="3.5" />
          <line x1="9.5" y1="16.5" x2="15.5" y2="16.5" />
        </svg>
      )
    case 'underline':
      return (
        <svg {...props}>
          <path d="M6 3.5v5.8a4 4 0 0 0 8 0V3.5" />
          <line x1="4.5" y1="16.5" x2="15.5" y2="16.5" />
        </svg>
      )
    case 'alignLeft':
      return (
        <svg {...props}>
          <line x1="3" y1="4.5" x2="17" y2="4.5" />
          <line x1="3" y1="8.5" x2="12" y2="8.5" />
          <line x1="3" y1="12.5" x2="17" y2="12.5" />
          <line x1="3" y1="16.5" x2="10" y2="16.5" />
        </svg>
      )
    case 'alignCenter':
      return (
        <svg {...props}>
          <line x1="3" y1="4.5" x2="17" y2="4.5" />
          <line x1="5.5" y1="8.5" x2="14.5" y2="8.5" />
          <line x1="3" y1="12.5" x2="17" y2="12.5" />
          <line x1="6" y1="16.5" x2="14" y2="16.5" />
        </svg>
      )
    case 'alignRight':
      return (
        <svg {...props}>
          <line x1="3" y1="4.5" x2="17" y2="4.5" />
          <line x1="8" y1="8.5" x2="17" y2="8.5" />
          <line x1="3" y1="12.5" x2="17" y2="12.5" />
          <line x1="10" y1="16.5" x2="17" y2="16.5" />
        </svg>
      )
    case 'alignJustify':
      return (
        <svg {...props}>
          <line x1="3" y1="4.5" x2="17" y2="4.5" />
          <line x1="3" y1="8.5" x2="17" y2="8.5" />
          <line x1="3" y1="12.5" x2="17" y2="12.5" />
          <line x1="3" y1="16.5" x2="17" y2="16.5" />
        </svg>
      )
    case 'bulletList':
      return (
        <svg {...props}>
          <circle cx="4.5" cy="5" r="1.2" fill="currentColor" stroke="none" />
          <line x1="8" y1="5" x2="16.5" y2="5" />
          <circle cx="4.5" cy="10" r="1.2" fill="currentColor" stroke="none" />
          <line x1="8" y1="10" x2="16.5" y2="10" />
          <circle cx="4.5" cy="15" r="1.2" fill="currentColor" stroke="none" />
          <line x1="8" y1="15" x2="16.5" y2="15" />
        </svg>
      )
    default:
      return null
  }
}

const TOOLBAR_GROUPS = [
  [
    { cmd: 'bold', icon: 'bold', title: 'Negrita' },
    { cmd: 'italic', icon: 'italic', title: 'Cursiva' },
    { cmd: 'underline', icon: 'underline', title: 'Subrayado' },
  ],
  [
    { cmd: 'justifyLeft', icon: 'alignLeft', title: 'Alinear izquierda' },
    { cmd: 'justifyCenter', icon: 'alignCenter', title: 'Centrar' },
    { cmd: 'justifyRight', icon: 'alignRight', title: 'Alinear derecha' },
    { cmd: 'justifyFull', icon: 'alignJustify', title: 'Justificar' },
  ],
  [{ cmd: 'insertUnorderedList', icon: 'bulletList', title: 'Viñetas' }],
  [
    { cmd: 'fontSize', value: '2', label: 'S', title: 'Texto pequeño' },
    { cmd: 'fontSize', value: '3', label: 'M', title: 'Texto normal' },
    { cmd: 'fontSize', value: '5', label: 'L', title: 'Texto grande' },
  ],
]

const RichTextBody = memo(
  forwardRef(function RichTextBody(
    { id, placeholder, minHeight, onInput, onBlur },
    ref
  ) {
    return (
      <div
        id={id}
        ref={ref}
        className="rich-text-body"
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        style={{ minHeight }}
        onInput={onInput}
        onBlur={onBlur}
      />
    )
  })
)

export default function RichTextEditor({
  value,
  onChange,
  placeholder = '',
  minHeight = 120,
  id,
}) {
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const emitChangeRef = useRef(() => {})
  const lastEmittedRef = useRef(null)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  function emitChange() {
    const html = sanitizeWorkspaceHtml(editorRef.current?.innerHTML ?? '')
    lastEmittedRef.current = html
    onChangeRef.current(html)
  }

  emitChangeRef.current = emitChange

  useEffect(() => {
    const node = editorRef.current

    if (!node) {
      return
    }

    const nextValue = value ?? ''

    if (document.activeElement === node) {
      return
    }

    if (lastEmittedRef.current !== null && nextValue === lastEmittedRef.current) {
      return
    }

    if (node.innerHTML !== nextValue) {
      node.innerHTML = nextValue
    }

    lastEmittedRef.current = nextValue
  }, [value])

  const handleInput = useCallback(() => {
    emitChangeRef.current()
  }, [])

  const handleBlur = useCallback(() => {
    emitChangeRef.current()
  }, [])

  useEffect(() => {
    function flushEditor() {
      emitChangeRef.current()
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
                key={`${item.cmd}-${item.value ?? item.icon ?? item.label}`}
                type="button"
                className={`rich-text-tool ${item.label ? 'rich-text-tool-text' : ''}`}
                title={item.title}
                aria-label={item.title}
                onMouseDown={(event) => {
                  event.preventDefault()
                  runCommand(item.cmd, item.value ?? null)
                }}
              >
                {item.icon ? <RichTextIcon name={item.icon} /> : item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      <RichTextBody
        ref={editorRef}
        id={id}
        placeholder={placeholder}
        minHeight={minHeight}
        onInput={handleInput}
        onBlur={handleBlur}
      />
    </div>
  )
}
