import React, { useRef, useState } from 'react'
import { Upload, X, File, CheckCircle, Loader } from 'lucide-react'
import { useStorage, formatSize } from '../context/StorageContext'

export default function UploadModal({ onClose }) {
  const { uploadFiles, uploadProgress } = useStorage()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState([])

  const addFiles = (files) => {
    const arr = Array.from(files).map(f => ({ file: f, id: Math.random().toString(36).slice(2) }))
    setQueue(prev => [...prev, ...arr])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleUpload = () => {
    if (queue.length === 0) return
    uploadFiles(queue.map(q => q.file))
  }

  const removeFromQueue = (id) => setQueue(prev => prev.filter(q => q.id !== id))

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
          borderRadius: 14,
          width: 480, maxWidth: '95vw',
          boxShadow: 'var(--shadow)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Upload Files</h3>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', lineHeight: 0 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '32px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
              transition: 'all var(--transition)',
              marginBottom: 16,
            }}
          >
            <Upload size={28} style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)', margin: '0 auto 10px' }} />
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
              Drop files here or click to browse
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              All file types • Max 5 GB per file • AES-256-GCM encrypted
            </div>
          </div>
          <input ref={inputRef} type="file" multiple hidden onChange={e => addFiles(e.target.files)} />

          {/* Queue */}
          {queue.length > 0 && (
            <div style={{ marginBottom: 16, maxHeight: 180, overflowY: 'auto' }}>
              {queue.map(({ file, id }) => (
                <div key={id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px',
                  background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                  marginBottom: 6,
                }}>
                  <File size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                    {file.name}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{formatSize(file.size)}</span>
                  <button onClick={() => removeFromQueue(id)} style={{ background: 'transparent', color: 'var(--text-muted)', lineHeight: 0 }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Progress */}
          {uploadProgress !== null && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {uploadProgress < 100
                    ? <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading…</>
                    : <><CheckCircle size={12} style={{ color: 'var(--success)' }} /> Done!</>
                  }
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${uploadProgress}%`,
                  background: uploadProgress < 100 ? 'var(--accent)' : 'var(--success)',
                  borderRadius: 3, transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{
              background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13,
            }}>
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={queue.length === 0 || uploadProgress !== null}
              style={{
                background: queue.length === 0 || uploadProgress !== null ? 'var(--bg-hover)' : 'var(--accent)',
                color: queue.length === 0 || uploadProgress !== null ? 'var(--text-muted)' : 'white',
                padding: '8px 16px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
                cursor: queue.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Upload {queue.length > 0 ? `(${queue.length})` : ''}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
