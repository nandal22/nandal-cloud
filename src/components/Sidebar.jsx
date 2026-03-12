import React, { useState } from 'react'
import {
  Cloud, Folder, FolderOpen, ChevronRight, ChevronDown,
  HardDrive, Star, Trash2, Clock, Shield, Plus, Image,
  FileCode, FileVideo, Archive, X
} from 'lucide-react'
import { useStorage, formatSize } from '../context/StorageContext'

const SPECIAL_SECTIONS = [
  { id: '__home',     label: 'All Files',   icon: HardDrive },
  { id: '__recent',   label: 'Recent',      icon: Clock },
  { id: '__starred',  label: 'Starred',     icon: Star },
  { id: '__encrypted',label: 'Encrypted',   icon: Shield },
  { id: '__trash',    label: 'Trash',       icon: Trash2 },
]

const TYPE_QUICK = [
  { id: '__images', label: 'Images', icon: Image,    color: '#ec4899' },
  { id: '__docs',   label: 'Docs',   icon: null,     color: '#6366f1' },
  { id: '__code',   label: 'Code',   icon: FileCode, color: '#22c55e' },
  { id: '__videos', label: 'Videos', icon: FileVideo, color: '#f59e0b' },
  { id: '__zips',   label: 'Archives', icon: Archive,color: '#78716c' },
]

function FolderNode({ folder, depth = 0 }) {
  const { folders, currentFolderId, setCurrentFolderId } = useStorage()
  const [open, setOpen] = useState(false)
  const children = folders.filter(f => f.parentId === folder.id)
  const hasChildren = children.length > 0
  const isActive = currentFolderId === folder.id

  return (
    <div>
      <button
        onClick={() => { setCurrentFolderId(folder.id); if (hasChildren) setOpen(o => !o) }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          padding: `6px 8px 6px ${16 + depth * 14}px`,
          background: isActive ? 'var(--accent-dim)' : 'transparent',
          color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          fontWeight: isActive ? 600 : 400,
          transition: 'all var(--transition)',
          textAlign: 'left',
        }}
        onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--bg-hover)')}
        onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
      >
        {hasChildren ? (
          <span onClick={e => { e.stopPropagation(); setOpen(o => !o) }} style={{ color: 'var(--text-muted)', lineHeight: 0 }}>
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        ) : (
          <span style={{ width: 13 }} />
        )}
        {open
          ? <FolderOpen size={15} style={{ color: folder.color, flexShrink: 0 }} />
          : <Folder size={15} style={{ color: folder.color, flexShrink: 0 }} />
        }
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {folder.name}
        </span>
      </button>
      {open && children.map(child => (
        <FolderNode key={child.id} folder={child} depth={depth + 1} />
      ))}
    </div>
  )
}

export default function Sidebar({ onCreateFolder, onClose, className }) {
  const { folders, currentFolderId, setCurrentFolderId, getStorageStats, searchQuery } = useStorage()
  const stats = getStorageStats()
  const usedPct = (stats.used / stats.total) * 100
  const rootFolders = folders.filter(f => f.parentId === null)

  return (
    <aside className={className || 'sidebar'} style={{
      width: 'var(--sidebar-width)',
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: '18px 16px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          width: 32, height: 32,
          background: 'linear-gradient(135deg, var(--accent), #a855f7)',
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Cloud size={18} color="white" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', flex: 1 }}>Nandal Cloud</span>
        {onClose && (
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'transparent', color: 'var(--text-muted)',
              padding: 4, borderRadius: 6, lineHeight: 0, display: 'none',
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>
      <style>{`
        @media (max-width: 767px) { .sidebar-close-btn { display: flex !important; } }
      `}</style>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {/* Main nav */}
        <div style={{ marginBottom: 6 }}>
          {SPECIAL_SECTIONS.map(({ id, label, icon: Icon }) => {
            const isActive = currentFolderId === id && !searchQuery
            return (
              <button
                key={id}
                onClick={() => setCurrentFolderId(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '7px 10px',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 13, fontWeight: isActive ? 600 : 400,
                  transition: 'all var(--transition)',
                }}
                onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={15} />
                {label}
              </button>
            )
          })}
        </div>

        {/* Quick filter by type */}
        <div style={{ padding: '8px 10px 4px', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          By Type
        </div>
        <div style={{ marginBottom: 6 }}>
          {TYPE_QUICK.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setCurrentFolderId(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '6px 10px',
                background: currentFolderId === id ? 'var(--accent-dim)' : 'transparent',
                color: currentFolderId === id ? color : 'var(--text-secondary)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                transition: 'all var(--transition)',
              }}
              onMouseEnter={e => currentFolderId !== id && (e.currentTarget.style.background = 'var(--bg-hover)')}
              onMouseLeave={e => currentFolderId !== id && (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
            </button>
          ))}
        </div>

        {/* Folder tree */}
        <div style={{
          padding: '8px 10px 4px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase',
        }}>
          <span>Folders</span>
          <button
            onClick={onCreateFolder}
            title="New folder"
            style={{
              background: 'transparent', color: 'var(--text-muted)',
              padding: 2, borderRadius: 4, lineHeight: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <Plus size={13} />
          </button>
        </div>
        <div style={{ marginBottom: 8 }}>
          {rootFolders.map(folder => (
            <FolderNode key={folder.id} folder={folder} />
          ))}
        </div>
      </div>

      {/* Storage bar */}
      <div style={{
        padding: '12px 14px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-secondary)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
          <span>{formatSize(stats.used)} used</span>
          <span>{formatSize(stats.total)}</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${usedPct}%`,
            background: usedPct > 80 ? 'var(--danger)' : 'linear-gradient(90deg, var(--accent), #a855f7)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{formatSize(stats.free)} free</div>
      </div>
    </aside>
  )
}
