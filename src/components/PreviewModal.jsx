import React from 'react'
import { X, Download, Trash2, FileText, FileCode, FileImage, FileVideo, File } from 'lucide-react'
import { useStorage, formatSize } from '../context/StorageContext'

const TYPE_CONFIG = {
  doc:         { color: '#6366f1' },
  pdf:         { color: '#ef4444' },
  image:       { color: '#ec4899' },
  video:       { color: '#f59e0b' },
  code:        { color: '#22c55e' },
  spreadsheet: { color: '#0ea5e9' },
  archive:     { color: '#78716c' },
  other:       { color: '#8b90b0' },
}

export default function PreviewModal() {
  const { previewFile, setPreviewFile, deleteFile } = useStorage()
  if (!previewFile) return null

  const { color } = TYPE_CONFIG[previewFile.type] || TYPE_CONFIG.other

  const handleClose = () => setPreviewFile(null)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          width: 600, maxWidth: '95vw', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <FileText size={16} style={{ color }} />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {previewFile.name}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {formatSize(previewFile.size)} · {previewFile.type} · {previewFile.createdAt}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={{
              background: 'transparent', color: 'var(--text-muted)',
              padding: '6px 8px', borderRadius: 6, fontSize: 12, lineHeight: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Download size={15} />
            </button>
            <button onClick={() => { deleteFile(previewFile.id); handleClose() }}
              style={{
                background: 'transparent', color: 'var(--text-muted)',
                padding: '6px 8px', borderRadius: 6, lineHeight: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Trash2 size={15} />
            </button>
            <button onClick={handleClose} style={{
              background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
              padding: '6px 8px', borderRadius: 6, lineHeight: 0,
              border: '1px solid var(--border)',
            }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {previewFile.content ? (
            <pre style={{
              background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 16,
              fontSize: 13, color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              fontFamily: previewFile.type === 'code' ? '"Fira Code", "Cascadia Code", monospace' : 'inherit',
              lineHeight: 1.6,
            }}>
              {previewFile.content}
            </pre>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 200, gap: 12,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <File size={32} style={{ color }} />
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
                Preview not available for this file type.<br />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Download to view the file.</span>
              </div>
              <button style={{
                background: 'var(--accent)', color: 'white',
                padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Download size={14} /> Download
              </button>
            </div>
          )}
        </div>

        {/* Tags */}
        {previewFile.tags && previewFile.tags.length > 0 && (
          <div style={{
            padding: '10px 18px 14px',
            borderTop: '1px solid var(--border)',
            display: 'flex', gap: 6, flexWrap: 'wrap',
          }}>
            {previewFile.tags.map(tag => (
              <span key={tag} style={{
                background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                fontSize: 11, padding: '3px 10px', borderRadius: 20,
                border: '1px solid var(--border)',
              }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
