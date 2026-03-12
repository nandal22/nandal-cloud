import React from 'react'
import { ChevronRight, Home } from 'lucide-react'
import { useStorage } from '../context/StorageContext'

const SPECIAL_LABELS = {
  '__home':      'All Files',
  '__recent':    'Recent',
  '__starred':   'Starred',
  '__encrypted': 'Encrypted',
  '__trash':     'Trash',
  '__images':    'Images',
  '__docs':      'Docs',
  '__code':      'Code',
  '__videos':    'Videos',
  '__zips':      'Archives',
}

export default function Breadcrumb() {
  const { currentFolderId, setCurrentFolderId, getBreadcrumb, searchQuery } = useStorage()

  if (searchQuery) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Search results for <strong style={{ color: 'var(--accent)' }}>"{searchQuery}"</strong>
        </span>
      </div>
    )
  }

  const specialLabel = SPECIAL_LABELS[currentFolderId]
  if (specialLabel) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{specialLabel}</span>
      </div>
    )
  }

  const crumbs = getBreadcrumb()

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <button
        onClick={() => setCurrentFolderId(null)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          background: 'transparent',
          color: crumbs.length === 0 ? 'var(--text-primary)' : 'var(--text-muted)',
          fontSize: 13, fontWeight: crumbs.length === 0 ? 600 : 400,
          padding: '3px 6px', borderRadius: 'var(--radius-sm)',
          transition: 'all var(--transition)',
        }}
        onMouseEnter={e => crumbs.length > 0 && (e.currentTarget.style.color = 'var(--text-primary)', e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => (e.currentTarget.style.color = crumbs.length === 0 ? 'var(--text-primary)' : 'var(--text-muted)', e.currentTarget.style.background = 'transparent')}
      >
        <Home size={13} />
        Home
      </button>

      {crumbs.map((folder, i) => (
        <React.Fragment key={folder.id}>
          <ChevronRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <button
            onClick={() => setCurrentFolderId(folder.id)}
            style={{
              background: 'transparent',
              color: i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 13,
              fontWeight: i === crumbs.length - 1 ? 600 : 400,
              padding: '3px 6px', borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => i < crumbs.length - 1 && (e.currentTarget.style.color = 'var(--text-primary)', e.currentTarget.style.background = 'var(--bg-hover)')}
            onMouseLeave={e => (e.currentTarget.style.color = i === crumbs.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)', e.currentTarget.style.background = 'transparent')}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  )
}
