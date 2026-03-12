import React, { useRef, useEffect } from 'react'
import { Search, X, Command } from 'lucide-react'
import { useStorage } from '../context/StorageContext'

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useStorage()
  const inputRef = useRef(null)

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

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      maxWidth: 480,
    }}>
      <Search
        size={15}
        style={{
          position: 'absolute',
          left: 12,
          color: searchQuery ? 'var(--accent)' : 'var(--text-muted)',
          pointerEvents: 'none',
          transition: 'color var(--transition)',
        }}
      />
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
        onFocus={e => {
          e.target.style.borderColor = 'var(--accent)'
          e.target.style.boxShadow = '0 0 0 3px var(--accent-dim)'
        }}
        onBlur={e => {
          if (!searchQuery) {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow = 'none'
          }
        }}
      />
      {searchQuery ? (
        <button
          onClick={() => setSearchQuery('')}
          style={{
            position: 'absolute', right: 10,
            background: 'var(--bg-hover)',
            color: 'var(--text-muted)',
            borderRadius: 4, padding: '2px 6px',
            fontSize: 11,
            display: 'flex', alignItems: 'center', gap: 3,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <X size={11} /> Clear
        </button>
      ) : (
        <div style={{
          position: 'absolute', right: 10,
          display: 'flex', alignItems: 'center', gap: 2,
          background: 'var(--bg-hover)',
          borderRadius: 4, padding: '2px 6px',
          fontSize: 11, color: 'var(--text-muted)',
          pointerEvents: 'none',
        }}>
          <Command size={11} />K
        </div>
      )}
    </div>
  )
}
