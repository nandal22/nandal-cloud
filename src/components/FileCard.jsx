import React, { useState } from 'react'
import {
  File, FileText, FileImage, FileVideo, FileAudio, FileCode,
  FileSpreadsheet, Archive,
  MoreVertical, Download, Trash2, Pencil, Move, Eye,
  CheckSquare, Square
} from 'lucide-react'
import { useStorage, formatSize } from '../context/StorageContext'

const TYPE_CONFIG = {
  doc:         { icon: FileText,        color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  pdf:         { icon: FileText,        color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  image:       { icon: FileImage,       color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  video:       { icon: FileVideo,       color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  audio:       { icon: FileAudio,       color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  code:        { icon: FileCode,        color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  spreadsheet: { icon: FileSpreadsheet, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  archive:     { icon: Archive,         color: '#78716c', bg: 'rgba(120,113,108,0.12)' },
  other:       { icon: File,            color: '#8b90b0', bg: 'rgba(139,144,176,0.12)' },
}

function ContextMenu({ file, onClose }) {
  const { deleteFile, setPreviewFile } = useStorage()

  const items = [
    { icon: Eye,       label: 'Preview',  action: () => { setPreviewFile(file); onClose() } },
    { icon: Download,  label: 'Download', action: () => { onClose() } },
    { icon: Pencil,    label: 'Rename',   action: () => { onClose() } },
    { icon: Move,      label: 'Move',     action: () => { onClose() } },
    { divider: true },
    { icon: Trash2,    label: 'Delete',   action: () => { deleteFile(file.id); onClose() }, danger: true },
  ]

  return (
    <div
      style={{
        position: 'absolute', top: 36, right: 8, zIndex: 100,
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        minWidth: 150, overflow: 'hidden',
      }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item, i) =>
        item.divider
          ? <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          : (
            <button
              key={i}
              onClick={item.action}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 12px',
                background: 'transparent',
                color: item.danger ? 'var(--danger)' : 'var(--text-secondary)',
                fontSize: 13,
                transition: 'background var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          )
      )}
    </div>
  )
}

export function FileCardGrid({ file }) {
  const { selectedIds, toggleSelect, setPreviewFile, searchQuery } = useStorage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const selected = selectedIds.has(file.id)
  const { icon: Icon, color, bg } = TYPE_CONFIG[file.type] || TYPE_CONFIG.other

  const highlight = (text) => {
    if (!searchQuery || !text) return text
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(99,102,241,0.4)', color: 'var(--text-primary)', borderRadius: 2, padding: '0 1px' }}>
          {text.slice(idx, idx + searchQuery.length)}
        </mark>
        {text.slice(idx + searchQuery.length)}
      </>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        background: selected ? 'var(--accent-dim)' : hovered ? 'var(--bg-card)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--accent)' : hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: 14,
        cursor: 'pointer',
        transition: 'all var(--transition)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      onClick={() => toggleSelect(file.id)}
      onDoubleClick={() => setPreviewFile(file)}
    >
      {/* Select checkbox */}
      <button
        onClick={e => { e.stopPropagation(); toggleSelect(file.id) }}
        style={{
          position: 'absolute', top: 8, left: 8,
          background: 'transparent',
          color: selected ? 'var(--accent)' : 'var(--text-muted)',
          opacity: selected || hovered ? 1 : 0,
          transition: 'opacity var(--transition)',
          lineHeight: 0,
        }}
      >
        {selected ? <CheckSquare size={16} /> : <Square size={16} />}
      </button>

      {/* More menu */}
      <button
        onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
        style={{
          position: 'absolute', top: 8, right: 8,
          background: menuOpen ? 'var(--bg-hover)' : 'transparent',
          color: 'var(--text-muted)',
          opacity: menuOpen || hovered ? 1 : 0,
          transition: 'opacity var(--transition)',
          padding: 3, borderRadius: 4, lineHeight: 0,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        <MoreVertical size={14} />
      </button>
      {menuOpen && <ContextMenu file={file} onClose={() => setMenuOpen(false)} />}

      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '10px auto 12px',
      }}>
        <Icon size={24} style={{ color }} />
      </div>

      {/* Name */}
      <div style={{
        fontSize: 13, fontWeight: 500, color: 'var(--text-primary)',
        textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis',
        whiteSpace: 'nowrap', marginBottom: 4,
      }}>
        {highlight(file.name)}
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, fontSize: 11, color: 'var(--text-muted)' }}>
        <span>{formatSize(file.size)}</span>
        <span>·</span>
        <span>{file.createdAt}</span>
      </div>

      {/* Tags */}
      {file.tags && file.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8, justifyContent: 'center' }}>
          {file.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              fontSize: 10, padding: '1px 6px', borderRadius: 20,
            }}>
              {highlight(tag)}
            </span>
          ))}
        </div>
      )}

      {/* Content preview for search */}
      {searchQuery && file.content && file.content.toLowerCase().includes(searchQuery.toLowerCase()) && (
        <div style={{
          marginTop: 8, padding: '6px 8px',
          background: 'var(--bg-tertiary)', borderRadius: 6,
          fontSize: 11, color: 'var(--text-secondary)',
          overflow: 'hidden', maxHeight: 48,
          borderLeft: '2px solid var(--accent)',
        }}>
          {highlight(file.content.slice(0, 80))}…
        </div>
      )}
    </div>
  )
}

export function FileCardList({ file }) {
  const { selectedIds, toggleSelect, setPreviewFile, searchQuery } = useStorage()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const selected = selectedIds.has(file.id)
  const { icon: Icon, color } = TYPE_CONFIG[file.type] || TYPE_CONFIG.other

  const highlight = (text) => {
    if (!searchQuery || !text) return text
    const idx = text.toLowerCase().indexOf(searchQuery.toLowerCase())
    if (idx === -1) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark style={{ background: 'rgba(99,102,241,0.4)', color: 'var(--text-primary)', borderRadius: 2, padding: '0 1px' }}>
          {text.slice(idx, idx + searchQuery.length)}
        </mark>
        {text.slice(idx + searchQuery.length)}
      </>
    )
  }

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: selected ? 'var(--accent-dim)' : hovered ? 'var(--bg-hover)' : 'transparent',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        transition: 'background var(--transition)',
        border: `1px solid ${selected ? 'var(--accent)' : 'transparent'}`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      onClick={() => toggleSelect(file.id)}
      onDoubleClick={() => setPreviewFile(file)}
    >
      {/* Checkbox */}
      <button
        onClick={e => { e.stopPropagation(); toggleSelect(file.id) }}
        style={{ background: 'transparent', color: selected ? 'var(--accent)' : 'var(--text-muted)', lineHeight: 0, flexShrink: 0 }}
      >
        {selected ? <CheckSquare size={15} /> : <Square size={15} />}
      </button>

      {/* Icon */}
      <div style={{ flexShrink: 0, lineHeight: 0 }}>
        <Icon size={18} style={{ color }} />
      </div>

      {/* Name */}
      <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {highlight(file.name)}
        {searchQuery && file.content && file.content.toLowerCase().includes(searchQuery.toLowerCase()) && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {highlight(file.content.slice(0, 60))}…
          </div>
        )}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {file.tags?.slice(0, 2).map(tag => (
          <span key={tag} style={{
            background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
            fontSize: 10, padding: '1px 6px', borderRadius: 20,
          }}>{highlight(tag)}</span>
        ))}
      </div>

      {/* Size */}
      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, width: 72, textAlign: 'right' }}>
        {formatSize(file.size)}
      </span>

      {/* Date */}
      <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, width: 88, textAlign: 'right' }}>
        {file.createdAt}
      </span>

      {/* Menu */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
          style={{
            background: 'transparent', color: 'var(--text-muted)',
            opacity: menuOpen || hovered ? 1 : 0,
            padding: 3, borderRadius: 4, lineHeight: 0,
            transition: 'opacity var(--transition)',
          }}
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen && <ContextMenu file={file} onClose={() => setMenuOpen(false)} />}
      </div>
    </div>
  )
}
