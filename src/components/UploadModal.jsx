import React, { useRef, useState } from 'react'
import { Upload, X, File, CheckCircle, Loader, AlertCircle } from 'lucide-react'
import { useStorage, formatSize } from '../context/StorageContext'

export default function UploadModal({ onClose }) {
  const { uploadFiles } = useStorage()
  const inputRef = useRef(null)
  const [dragging, setDragging]       = useState(false)
  const [queue, setQueue]             = useState([])        // [{ file, id, progress, status }]
  const [uploading, setUploading]     = useState(false)
  const [overallPct, setOverallPct]   = useState(0)

  const addFiles = (files) => {
    const arr = Array.from(files).map(f => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      progress: 0,
      status: 'pending', // pending | uploading | done | error
    }))
    setQueue(prev => [...prev, ...arr])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleUpload = async () => {
    if (queue.length === 0 || uploading) return
    setUploading(true)
    setOverallPct(0)

    // Mark all as uploading
    setQueue(prev => prev.map(q => ({ ...q, status: 'uploading', progress: 0 })))

    const onProgress = (fileIndex, pct) => {
      setQueue(prev => prev.map((q, i) =>
        i === fileIndex
          ? { ...q, progress: pct, status: pct === 100 ? 'done' : 'uploading' }
          : q
      ))
      // Recalculate overall from per-file progress
      setQueue(prev => {
        const total = prev.reduce((acc, q) => acc + q.progress, 0)
        setOverallPct(Math.round(total / prev.length))
        return prev
      })
    }

    await uploadFiles(queue.map(q => q.file), onProgress)

    setQueue(prev => prev.map(q => ({ ...q, status: 'done', progress: 100 })))
    setOverallPct(100)
    setUploading(false)

    // Auto-close after a short delay when all done
    setTimeout(onClose, 800)
  }

  const removeFromQueue = (id) => {
    if (uploading) return
    setQueue(prev => prev.filter(q => q.id !== id))
  }

  const allDone    = queue.length > 0 && queue.every(q => q.status === 'done')
  const canUpload  = queue.length > 0 && !uploading

  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={uploading ? undefined : onClose}
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
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
            Upload Files
          </h3>
          {!uploading && (
            <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)', lineHeight: 0, minHeight: 'unset' }}>
              <X size={18} />
            </button>
          )}
        </div>

        <div style={{ padding: 20 }}>
          {/* Drop zone — hide while uploading */}
          {!uploading && (
            <>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '28px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'var(--accent-dim)' : 'var(--bg-tertiary)',
                  transition: 'all var(--transition)',
                  marginBottom: 14,
                }}
              >
                <Upload size={26} style={{ color: dragging ? 'var(--accent)' : 'var(--text-muted)', margin: '0 auto 8px' }} />
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                  Drop files here or tap to browse
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Any size · All file types · AES-256 encrypted
                </div>
              </div>
              <input ref={inputRef} type="file" multiple hidden onChange={e => addFiles(e.target.files)} />
            </>
          )}

          {/* File list with per-file progress bars */}
          {queue.length > 0 && (
            <div style={{ marginBottom: 16, maxHeight: 240, overflowY: 'auto' }}>
              {queue.map(({ file, id, progress, status }, idx) => (
                <div key={id} style={{
                  marginBottom: 8,
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  border: `1px solid ${status === 'done' ? 'rgba(34,197,94,0.3)' : status === 'error' ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px' }}>
                    {/* Status icon */}
                    {status === 'done'
                      ? <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />
                      : status === 'error'
                      ? <AlertCircle size={15} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                      : status === 'uploading'
                      ? <Loader size={15} style={{ color: 'var(--accent)', flexShrink: 0, animation: 'spin 1s linear infinite' }} />
                      : <File size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    }

                    {/* Name + size */}
                    <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
                      {file.name}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>
                      {formatSize(file.size)}
                    </span>
                    {!uploading && (
                      <button onClick={() => removeFromQueue(id)} style={{
                        background: 'transparent', color: 'var(--text-muted)', lineHeight: 0, minHeight: 'unset', padding: 2,
                      }}>
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {/* Per-file progress bar (shown while uploading) */}
                  {(status === 'uploading' || status === 'done') && (
                    <div style={{ height: 3, background: 'var(--bg-hover)' }}>
                      <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: status === 'done' ? 'var(--success)' : 'var(--accent)',
                        transition: 'width 0.2s ease',
                      }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Overall progress bar */}
          {uploading && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {allDone
                    ? <><CheckCircle size={12} style={{ color: 'var(--success)' }} /> All done!</>
                    : <><Loader size={12} style={{ animation: 'spin 1s linear infinite' }} /> Uploading directly to storage…</>
                  }
                </span>
                <span>{overallPct}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${overallPct}%`,
                  background: allDone ? 'var(--success)' : 'linear-gradient(90deg, var(--accent), #a855f7)',
                  borderRadius: 3, transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Files upload directly to Supabase Storage — no size limit
              </div>
            </div>
          )}

          {/* Actions */}
          {!uploading && (
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
                disabled={!canUpload}
                style={{
                  background: canUpload ? 'var(--accent)' : 'var(--bg-hover)',
                  color: canUpload ? 'white' : 'var(--text-muted)',
                  padding: '8px 18px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
                  cursor: canUpload ? 'pointer' : 'not-allowed',
                }}
              >
                Upload {queue.length > 0 ? `(${queue.length})` : ''}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
