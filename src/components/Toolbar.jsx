import React from 'react'
import {
  LayoutGrid, List, Upload, FolderPlus, Trash2,
  SortAsc, SortDesc, ChevronDown, X, Download,
} from 'lucide-react'
import { useStorage } from '../context/StorageContext'

export default function Toolbar({ onUploadClick, onCreateFolder }) {
  const {
    viewMode, setViewMode,
    sortBy, setSortBy, sortDir, setSortDir,
    selectedIds, clearSelection, deleteSelected,
  } = useStorage()

  const selectedCount = selectedIds.size

  const sorts = [
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date' },
    { value: 'size', label: 'Size' },
  ]

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 0',
    }}>
      {/* Upload */}
      <button
        onClick={onUploadClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--accent)', color: 'white',
          padding: '7px 14px', borderRadius: 'var(--radius-sm)',
          fontSize: 13, fontWeight: 600,
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
      >
        <Upload size={14} />
        Upload
      </button>

      {/* New Folder */}
      <button
        onClick={onCreateFolder}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
          border: '1px solid var(--border)',
          padding: '7px 12px', borderRadius: 'var(--radius-sm)',
          fontSize: 13,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-secondary)' }}
      >
        <FolderPlus size={14} />
        New Folder
      </button>

      <div style={{ flex: 1 }} />

      {/* Selection bar */}
      {selectedCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--accent-dim)', border: '1px solid var(--accent)',
          borderRadius: 'var(--radius-sm)', padding: '5px 10px',
        }}>
          <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>
            {selectedCount} selected
          </span>
          <button onClick={deleteSelected} style={{ background: 'transparent', color: 'var(--danger)', lineHeight: 0, padding: 2 }}>
            <Trash2 size={14} />
          </button>
          <button onClick={clearSelection} style={{ background: 'transparent', color: 'var(--text-muted)', lineHeight: 0, padding: 2 }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '6px 10px', fontSize: 12, cursor: 'pointer',
          }}
        >
          {sorts.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          style={{
            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
            padding: '6px 8px', lineHeight: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          {sortDir === 'asc' ? <SortAsc size={14} /> : <SortDesc size={14} />}
        </button>
      </div>

      {/* View toggle */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', overflow: 'hidden',
      }}>
        {[
          { mode: 'grid', icon: LayoutGrid },
          { mode: 'list', icon: List },
        ].map(({ mode, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              background: viewMode === mode ? 'var(--bg-hover)' : 'transparent',
              color: viewMode === mode ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '6px 10px', lineHeight: 0,
              borderRight: mode === 'grid' ? '1px solid var(--border)' : 'none',
            }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
    </div>
  )
}
