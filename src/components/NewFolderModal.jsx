import React, { useState, useRef, useEffect } from 'react'
import { X, FolderPlus } from 'lucide-react'
import { useStorage } from '../context/StorageContext'

export default function NewFolderModal({ onClose }) {
  const { createFolder } = useStorage()
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    createFolder(name.trim())
    onClose()
  }

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="modal-sheet"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          width: 360, maxWidth: '95vw',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FolderPlus size={16} style={{ color: 'var(--accent)' }} />
            New Folder
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', lineHeight: 0 }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 18 }}>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Folder name"
            style={{
              width: '100%', background: 'var(--bg-tertiary)',
              border: '1px solid var(--border)', borderRadius: 8,
              padding: '9px 12px', color: 'var(--text-primary)', fontSize: 14,
              marginBottom: 14,
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              padding: '8px 14px', borderRadius: 8, fontSize: 13,
            }}>
              Cancel
            </button>
            <button type="submit" disabled={!name.trim()} style={{
              background: name.trim() ? 'var(--accent)' : 'var(--bg-hover)',
              color: name.trim() ? 'white' : 'var(--text-muted)',
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            }}>
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
