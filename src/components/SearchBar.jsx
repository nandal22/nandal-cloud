import React, { useRef, useEffect } from 'react'
import { Search, X, Command } from 'lucide-react'
import { useStorage } from '../context/StorageContext'

export default function SearchBar({ mobileVisible, onMobileClose }) {
  const { searchQuery, setSearchQuery } = useStorage()
  const inputRef       = useRef(null)
  const mobileInputRef = useRef(null)

  // Cmd/Ctrl + K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Auto-focus mobile search when it opens
  useEffect(() => {
    if (mobileVisible) setTimeout(() => mobileInputRef.current?.focus(), 50)
  }, [mobileVisible])

  const handleClear = () => {
    setSearchQuery('')
    onMobileClose?.()
  }

  return (
    <>
      {/* Desktop search — hidden on mobile via CSS */}
      <div className="searchbar-desktop" style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        flex: 1,
        maxWidth: 480,
      }}>
        <Search size={15} style={{
          position: 'absolute', left: 12,
          color: searchQuery ? 'var(--accent)' : 'var(--text-muted)',
          pointerEvents: 'none',
          transition: 'color var(--transition)',
        }} />
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search files, folders, content…"
          style={{
            width: '100%',
            background: 'var(--bg-tertiary)',
            border: `1px solid ${searchQuery ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 8,
            padding: '8px 80px 8px 36px',
            color: 'var(--text-primary)',
            fontSize: 13,
            transition: 'all var(--transition)',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)' }}
          onBlur={e => { if (!searchQuery) { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none' } }}
        />
        {searchQuery ? (
          <button onClick={handleClear} style={{
            position: 'absolute', right: 10,
            background: 'var(--bg-hover)', color: 'var(--text-muted)',
            borderRadius: 4, padding: '2px 6px', fontSize: 11, minHeight: 'unset',
            display: 'flex', alignItems: 'center', gap: 3,
          }}>
            <X size={11} /> Clear
          </button>
        ) : (
          <div style={{
            position: 'absolute', right: 10,
            display: 'flex', alignItems: 'center', gap: 2,
            background: 'var(--bg-hover)', borderRadius: 4, padding: '2px 6px',
            fontSize: 11, color: 'var(--text-muted)', pointerEvents: 'none',
          }}>
            <Command size={11} />K
          </div>
        )}
      </div>

      {/* Mobile full-screen search overlay */}
      {mobileVisible && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'var(--bg-secondary)',
          display: 'flex', flexDirection: 'column',
          padding: '12px 14px', gap: 12,
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* Input row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--accent)', pointerEvents: 'none',
              }} />
              <input
                ref={mobileInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files, folders, content…"
                style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--accent)',
                  borderRadius: 8,
                  padding: '12px 40px 12px 36px',
                  color: 'var(--text-primary)',
                  fontSize: 16,
                  boxShadow: '0 0 0 3px var(--accent-dim)',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', color: 'var(--text-muted)', lineHeight: 0,
                  minHeight: 'unset', padding: 4,
                }}>
                  <X size={15} />
                </button>
              )}
            </div>
            <button onClick={onMobileClose} style={{
              background: 'transparent', color: 'var(--accent)',
              fontSize: 14, fontWeight: 600, padding: '8px 0',
              minHeight: 'unset', flexShrink: 0,
            }}>
              Cancel
            </button>
          </div>

          {!searchQuery && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
              Search by filename, tag, or file content
            </p>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .searchbar-desktop { display: none !important; }
        }
      `}</style>
    </>
  )
}
