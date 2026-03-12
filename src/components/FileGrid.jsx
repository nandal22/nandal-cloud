import React from 'react'
import { FolderOpen, Search } from 'lucide-react'
import { useStorage } from '../context/StorageContext'
import { FileCardGrid, FileCardList } from './FileCard'
import FolderCard from './FolderCard'

// ── Virtual type filters ───────────────────────────────────────────────────────
const TYPE_FILTERS = {
  '__images': f => f.type === 'image',
  '__docs':   f => ['doc', 'pdf', 'spreadsheet'].includes(f.type),
  '__code':   f => f.type === 'code',
  '__videos': f => f.type === 'video',
  '__zips':   f => f.type === 'archive',
  '__recent': () => true,  // sorted by date outside
  '__starred': () => false, // placeholder
  '__encrypted': () => false,
  '__trash': () => false,
  '__home': () => true,
}

export default function FileGrid() {
  const { currentFolderFiles, currentSubFolders, viewMode, currentFolderId, searchQuery, files } = useStorage()

  // For virtual sections, override file list
  let displayFiles = currentFolderFiles
  let displayFolders = currentSubFolders

  if (TYPE_FILTERS[currentFolderId]) {
    displayFiles = files.filter(TYPE_FILTERS[currentFolderId])
    if (currentFolderId === '__recent') {
      displayFiles = [...displayFiles].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 20)
    }
    displayFolders = []
  }

  const isEmpty = displayFiles.length === 0 && displayFolders.length === 0

  if (isEmpty) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        color: 'var(--text-muted)',
      }}>
        {searchQuery
          ? <>
              <Search size={36} style={{ opacity: 0.3 }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>No results for "{searchQuery}"</div>
              <div style={{ fontSize: 13 }}>Try searching for a different term</div>
            </>
          : <>
              <FolderOpen size={40} style={{ opacity: 0.25 }} />
              <div style={{ fontSize: 15, fontWeight: 600 }}>This folder is empty</div>
              <div style={{ fontSize: 13 }}>Upload files or create a subfolder</div>
            </>
        }
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 4px' }}>
        {/* List header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '6px 14px', marginBottom: 4,
          fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ width: 15 }} />
          <span style={{ width: 18 }} />
          <span style={{ flex: 1 }}>Name</span>
          <span style={{ width: 120 }}>Tags</span>
          <span style={{ width: 72, textAlign: 'right' }}>Size</span>
          <span style={{ width: 88, textAlign: 'right' }}>Date</span>
          <span style={{ width: 24 }} />
        </div>

        {/* Folders */}
        {displayFolders.map(folder => (
          <div key={folder.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'background var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <span style={{ width: 15 }} />
            <span style={{ fontSize: 18 }}>📁</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{folder.name}</span>
            <span style={{ width: 120 }} />
            <span style={{ width: 72, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>—</span>
            <span style={{ width: 88, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>{folder.createdAt}</span>
            <span style={{ width: 24 }} />
          </div>
        ))}

        {/* Files */}
        {displayFiles.map(file => (
          <FileCardList key={file.id} file={file} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {/* Folders section */}
      {displayFolders.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            marginBottom: 10, padding: '0 2px',
          }}>
            Folders
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 10,
          }}>
            {displayFolders.map(folder => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        </div>
      )}

      {/* Files section */}
      {displayFiles.length > 0 && (
        <div>
          {displayFolders.length > 0 && (
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 10, padding: '0 2px',
            }}>
              Files {searchQuery && <span style={{ color: 'var(--accent)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>— {displayFiles.length} result{displayFiles.length !== 1 ? 's' : ''}</span>}
            </div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 10,
          }}>
            {displayFiles.map(file => (
              <FileCardGrid key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
