import React, { useState } from 'react'
import { Folder, FolderOpen, MoreVertical, Trash2, Pencil, FolderPlus } from 'lucide-react'
import { useStorage } from '../context/StorageContext'

export default function FolderCard({ folder }) {
  const { currentFolderId, setCurrentFolderId, deleteFolder, files, folders } = useStorage()
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const fileCount = files.filter(f => f.folderId === folder.id).length
  const subFolderCount = folders.filter(f => f.parentId === folder.id).length

  return (
    <div
      style={{
        position: 'relative',
        background: hovered ? 'var(--bg-hover)' : 'var(--bg-card)',
        border: `1px solid ${hovered ? 'var(--border-hover)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        padding: '14px 14px 12px',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMenuOpen(false) }}
      onDoubleClick={() => setCurrentFolderId(folder.id)}
    >
      {/* Menu */}
      <button
        onClick={e => { e.stopPropagation(); setMenuOpen(o => !o) }}
        style={{
          position: 'absolute', top: 8, right: 8,
          background: 'transparent', color: 'var(--text-muted)',
          opacity: menuOpen || hovered ? 1 : 0,
          padding: 3, borderRadius: 4, lineHeight: 0,
          transition: 'opacity var(--transition)',
        }}
      >
        <MoreVertical size={14} />
      </button>

      {menuOpen && (
        <div
          style={{
            position: 'absolute', top: 30, right: 8, zIndex: 100,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', minWidth: 140, overflow: 'hidden',
          }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { icon: FolderOpen, label: 'Open',   action: () => { setCurrentFolderId(folder.id); setMenuOpen(false) } },
            { icon: Pencil,     label: 'Rename',  action: () => setMenuOpen(false) },
            { divider: true },
            { icon: Trash2,     label: 'Delete',  action: () => deleteFolder(folder.id), danger: true },
          ].map((item, i) =>
            item.divider
              ? <div key={i} style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              : (
                <button key={i} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '8px 12px', background: 'transparent',
                  color: item.danger ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 13,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <item.icon size={14} />{item.label}
                </button>
              )
          )}
        </div>
      )}

      {/* Icon */}
      <div style={{ lineHeight: 0, marginBottom: 10 }}>
        {hovered
          ? <FolderOpen size={32} style={{ color: folder.color }} />
          : <Folder size={32} style={{ color: folder.color }} />
        }
      </div>

      {/* Name */}
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {folder.name}
      </div>

      {/* Meta */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {fileCount} file{fileCount !== 1 ? 's' : ''}
        {subFolderCount > 0 && ` · ${subFolderCount} folder${subFolderCount !== 1 ? 's' : ''}`}
      </div>
    </div>
  )
}
